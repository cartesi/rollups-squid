import { DataHandlerContext } from '@subsquid/evm-processor';
import { Store } from '@subsquid/typeorm-store';
import { AbiCoder, dataSlice, getUint } from 'ethers';
import { Contract as ERC20 } from '../../abi/ERC20';
import { Contract as ERC721 } from '../../abi/ERC721';
import { events } from '../../abi/InputBoxV2';
import { RollupsAddressBook } from '../../config';
import {
    Application,
    Chain,
    Erc1155Deposit,
    Erc1155Transfer,
    Erc20Deposit,
    Erc721Deposit,
    Input,
    MultiToken,
    NFT,
    RollupVersion,
    Token,
} from '../../model';
import { BlockData, Log } from '../../processor';

import { Hex } from 'viem';
import decodeEvmAdvance from '../../decoders/evmAdvance';
import { generateIDFrom } from '../../utils';
import Handler from '../Handler';

const logErrorAndReturnNull =
    (ctx: DataHandlerContext<Store>) => (reason: any) => {
        ctx.log.error(reason);
        return null;
    };
export default class InputAdded implements Handler {
    constructor(
        private tokenStorage: Map<string, Token>,
        private depositStorage: Map<string, Erc20Deposit>,
        private applicationStorage: Map<string, Application>,
        private inputStorage: Map<string, Input>,
        private nftStorage: Map<string, NFT>,
        private erc721DepositStorage: Map<string, Erc721Deposit>,
        private multiTokenStorage: Map<string, MultiToken>,
        private erc1155DepositStorage: Map<string, Erc1155Deposit>,
        private chainStorage: Map<string, Chain>,
    ) {}

    private async prepareErc20Deposit(
        input: Input,
        block: BlockData,
        ctx: DataHandlerContext<Store>,
        opts: {
            inputId: string;
            chain: Chain;
        },
    ) {
        if (input.msgSender !== RollupsAddressBook.v2.ERC20Portal)
            return undefined;

        const chain = opts.chain;

        const tokenAddress = dataSlice(input.payload, 0, 20).toLowerCase(); // 20 bytes for address
        const from = dataSlice(input.payload, 20, 40).toLowerCase(); // 20 bytes for address
        const amount = getUint(dataSlice(input.payload, 40, 72)); // 32 bytes for uint256
        const tokenId = generateIDFrom([chain.id, tokenAddress]);

        let token = this.tokenStorage.get(tokenId) as Token;
        if (!token) {
            const contract = new ERC20(ctx, block.header, tokenAddress);
            const name = await contract.name();
            const symbol = await contract.symbol();
            const decimals = await contract.decimals();
            token = new Token({
                id: tokenId,
                name,
                symbol,
                decimals,
                chain: chain,
                address: tokenAddress,
            });
            this.tokenStorage.set(tokenId, token);
            ctx.log.info(`${tokenId} (Token) stored`);
        }
        const deposit = new Erc20Deposit({
            id: input.id,
            amount,
            from,
            token,
            chain: opts.chain,
        });

        this.depositStorage.set(opts.inputId, deposit);
        ctx.log.info(`${opts.inputId} (Erc20Deposit) stored`);

        return deposit;
    }

    private async prepareErc721Deposit(
        input: Input,
        block: BlockData,
        ctx: DataHandlerContext<Store>,
        opts: {
            inputId: string;
            chain: Chain;
        },
    ) {
        if (input.msgSender !== RollupsAddressBook.v2.ERC721Portal)
            return undefined;

        const chain = opts.chain;

        const tokenAddress = dataSlice(input.payload, 0, 20).toLowerCase(); // 20 bytes for address
        const from = dataSlice(input.payload, 20, 40).toLowerCase(); // 20 bytes for address
        const tokenIndex = getUint(dataSlice(input.payload, 40, 72)); // 32 bytes for uint256
        const tokenId = generateIDFrom([chain.id, tokenAddress]);

        let nft = this.nftStorage.get(tokenId);
        if (!nft) {
            const contract = new ERC721(ctx, block.header, tokenAddress);
            const name = await contract
                .name()
                .catch(logErrorAndReturnNull(ctx));
            const symbol = await contract
                .symbol()
                .catch(logErrorAndReturnNull(ctx));
            nft = new NFT({
                id: tokenId,
                name,
                symbol,
                chain,
                address: tokenAddress,
            });
            this.nftStorage.set(tokenId, nft);
            ctx.log.info(`${tokenId} (NFT) stored`);
        }

        const deposit = new Erc721Deposit({
            id: input.id,
            from,
            token: nft,
            tokenIndex,
            chain,
        });

        this.erc721DepositStorage.set(opts.inputId, deposit);
        ctx.log.info(`${opts.inputId} (Erc721Deposit) stored`);

        return deposit;
    }

    private async prepareErc1155Deposit(
        input: Input,
        _block: BlockData,
        ctx: DataHandlerContext<Store>,
        opts: {
            inputId: string;
            chain: Chain;
        },
    ) {
        const { ERC1155BatchPortal, ERC1155SinglePortal } =
            RollupsAddressBook.v2;

        if (
            input.msgSender !== ERC1155BatchPortal &&
            input.msgSender !== ERC1155SinglePortal
        )
            return undefined;

        const chain = opts.chain;

        const tokenAddress = dataSlice(input.payload, 0, 20).toLowerCase(); // 20 bytes for token address
        const from = dataSlice(input.payload, 20, 40).toLowerCase(); // 20 bytes for from address
        const tokenId = generateIDFrom([chain.id, tokenAddress]);
        let transfers: Erc1155Transfer[] = [];

        if (input.msgSender === ERC1155BatchPortal) {
            ctx.log.info(`${input.id} (ERC-1155) batch deposit`);
            const data = dataSlice(input.payload, 40); // Data arbitrary size
            const [tokenIds, amounts] = new AbiCoder().decode(
                ['uint256[]', 'uint256[]'],
                data,
            );
            transfers = tokenIds.map(
                (tokenIndex: bigint, idx: number) =>
                    new Erc1155Transfer({ tokenIndex, amount: amounts[idx] }),
            );
        } else if (input.msgSender === ERC1155SinglePortal) {
            ctx.log.info(`${input.id} (ERC-1155) single deposit`);
            const tokenIndex = getUint(dataSlice(input.payload, 40, 72)); // 32 bytes for tokenId
            const amount = getUint(dataSlice(input.payload, 72, 104)); // 32 bytes for value a.k.a amount
            transfers = [new Erc1155Transfer({ tokenIndex, amount })];
        }

        let token = this.multiTokenStorage.get(tokenId);

        if (!token) {
            token = new MultiToken({
                id: tokenId,
                chain,
                address: tokenAddress,
            });
            this.multiTokenStorage.set(tokenId, token);
            ctx.log.info(`${tokenId} (ERC-1155) contract stored.`);
        }

        const deposit = new Erc1155Deposit({
            id: input.id,
            from,
            token,
            transfers,
            chain,
        });

        this.erc1155DepositStorage.set(input.id, deposit);
        ctx.log.info(`${input.id} (Erc1155Deposit) stored`);

        return deposit;
    }

    async handle(log: Log, block: BlockData, ctx: DataHandlerContext<Store>) {
        if (
            log.address === RollupsAddressBook.v2.InputBox &&
            log.topics[0] === events.InputAdded.topic
        ) {
            if (!log.transaction?.chainId)
                throw new Error(
                    'Chain id is required to save InputAdded events and related data!',
                );

            const chain = new Chain({
                id: log.transaction.chainId.toString(),
            });

            // Storing Chain
            this.chainStorage.set(chain.id, chain);

            const timestamp = BigInt(log.block.timestamp);
            const event = events.InputAdded.decode(log);
            const { appContract, msgSender, payload, index } = decodeEvmAdvance(
                event.input as Hex,
            );
            const appAddress = appContract.toLowerCase();
            const appId = generateIDFrom([
                chain.id,
                appAddress,
                RollupVersion.v2,
            ]);

            const timestampInSeconds = timestamp / 1000n;

            let application =
                this.applicationStorage.get(appId) ??
                (await ctx.store.get(Application, appId));
            if (!application) {
                ctx.log.warn(`${appId} (Application v2) not found`);
                application = new Application({
                    id: appId,
                    timestamp: timestampInSeconds,
                    chain: chain,
                    address: appAddress,
                    rollupVersion: RollupVersion.v2,
                });
                this.applicationStorage.set(appId, application);
                ctx.log.info(`${appId} (Application v2) stored`);
            }

            const inputId = generateIDFrom([appId, index]);

            const input = new Input({
                id: inputId,
                application,
                index: Number(event.index),
                msgSender: msgSender.toLowerCase(),
                payload: payload,
                timestamp: timestampInSeconds,
                blockNumber: BigInt(log.block.height),
                blockHash: log.block.hash,
                transactionHash: log.transaction?.hash,
                chain: chain,
            });

            const params = [input, block, ctx, { inputId, chain }] as const;

            input.erc20Deposit = await this.prepareErc20Deposit(...params);

            input.erc721Deposit = await this.prepareErc721Deposit(...params);

            input.erc1155Deposit = await this.prepareErc1155Deposit(...params);

            this.inputStorage.set(inputId, input);
            ctx.log.info(`${inputId} (Input) stored`);
        }

        return true;
    }
}
