import { afterEach } from 'node:test';
import { sepolia } from 'viem/chains';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Contract as ERC20 } from '../../../src/abi/ERC20';
import { Contract as ERC721 } from '../../../src/abi/ERC721';
import InputAdded from '../../../src/handlers/v2/InputAdded';
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
    Token,
} from '../../../src/model';
import { mockModelImplementation } from '../../stubs/mocks';
import {
    block,
    ctx,
    logErc1155BatchTransferV2,
    logErc1155SingleTransferV2,
    logErc20TransferV2,
    logErc721Transfer,
    logErc721TransferV2,
    logInputAddedV2,
    logs,
} from '../../stubs/params';

vi.mock('../../../src/abi/ERC20');

vi.mock('../../../src/abi/ERC721');

vi.mock('../../../src/model/', async () => {
    const Token = vi.fn();
    const Erc20Deposit = vi.fn();
    const Application = vi.fn();
    const Input = vi.fn();
    const Erc721Deposit = vi.fn();
    const NFT = vi.fn();
    const Erc1155Deposit = vi.fn();
    const MultiToken = vi.fn();
    const Erc1155Transfer = vi.fn();
    const Chain = vi.fn();
    const RollupVersion = { v1: 'v1', v2: 'v2' };

    return {
        Application,
        Token,
        Erc20Deposit,
        Erc721Deposit,
        Input,
        NFT,
        MultiToken,
        Erc1155Deposit,
        Erc1155Transfer,
        Chain,
        RollupVersion,
    };
});

const ApplicationMock = mockModelImplementation(Application);
const InputMock = mockModelImplementation(Input);
const NFTStub = mockModelImplementation(NFT);
const ERC721Mock = vi.mocked(ERC721, true);
const ERC721DepositStub = mockModelImplementation(Erc721Deposit);
const ERC20Mock = vi.mocked(ERC20, true);
const ERC20DepositStub = mockModelImplementation(Erc20Deposit);
const TokenStub = mockModelImplementation(Token);
const MultiTokenStub = mockModelImplementation(MultiToken);
const ERC1155DepositStub = mockModelImplementation(Erc1155Deposit);
const ERC1155TransferStub = mockModelImplementation(Erc1155Transfer);
const ChainStub = mockModelImplementation(Chain);

describe('InputAdded', () => {
    let inputAdded: InputAdded;
    const mockTokenStorage = new Map();
    const mockDepositStorage = new Map();
    const mockInputStorage = new Map();
    const mockApplicationStorage = new Map();
    const mockNftStorage = new Map();
    const mockErc721DepositStorage = new Map();
    const mockMultiTokenStorage = new Map<string, MultiToken>();
    const mockErc1155DepositStorage = new Map<string, Erc1155Deposit>();
    const mockChainStorage = new Map<string, Chain>();
    const expectedChain = { id: sepolia.id.toString() };

    beforeEach(() => {
        inputAdded = new InputAdded(
            mockTokenStorage,
            mockDepositStorage,
            mockApplicationStorage,
            mockInputStorage,
            mockNftStorage,
            mockErc721DepositStorage,
            mockMultiTokenStorage,
            mockErc1155DepositStorage,
            mockChainStorage,
        );

        mockTokenStorage.clear();
        mockDepositStorage.clear();
        mockApplicationStorage.clear();
        mockInputStorage.clear();
        mockNftStorage.clear();
        mockErc721DepositStorage.clear();
        mockMultiTokenStorage.clear();
        mockErc1155DepositStorage.clear();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('handle', async () => {
        test('should ignore events other than InputAdded', async () => {
            await inputAdded.handle(logs[1], block, ctx);
            expect(mockInputStorage.size).toBe(0);
            expect(mockApplicationStorage.size).toBe(0);
            expect(mockDepositStorage.size).toBe(0);
        });

        test('should handle event type InputAdded', async () => {
            await inputAdded.handle(logInputAddedV2, block, ctx);
            expect(mockApplicationStorage.size).toBe(1);
            expect(mockInputStorage.size).toBe(1);
        });

        test('when creating a non-existing app it should also set the timestamp in seconds', async () => {
            await inputAdded.handle(logInputAddedV2, block, ctx);

            const timestamp = BigInt(logInputAddedV2.block.timestamp) / 1000n;

            const [application] = mockApplicationStorage.values();
            expect(application).toEqual({
                id: `${sepolia.id}-0xfb92024ec789bb2fbbc5cd1390386843c5fb7694-v2`,
                address: '0xfb92024ec789bb2fbbc5cd1390386843c5fb7694',
                timestamp,
                chain: expectedChain,
                rollupVersion: 'v2',
            });
        });

        test('should throw error when chain-id information is not available in the Log ', async () => {
            try {
                const clonedLog = structuredClone(logInputAddedV2);
                delete clonedLog.transaction?.chainId;
                await inputAdded.handle(clonedLog, block, ctx);
                expect(true).toEqual('Should not reach that expectation.');
            } catch (error) {
                expect(error.message).toEqual(
                    'Chain id is required to save InputAdded events and related data!',
                );
            }
        });

        describe('ERC-20 deposit', () => {
            const name = 'Wrapped Ether';
            const symbol = 'WETH';
            const decimals = 18;

            beforeEach(() => {
                // some default returns for the ERC20 contract calls
                ERC20Mock.prototype.name.mockResolvedValue(name);
                ERC20Mock.prototype.symbol.mockResolvedValue(symbol);
                ERC20Mock.prototype.decimals.mockResolvedValue(decimals);
            });

            afterEach(() => {
                vi.clearAllMocks();
            });

            test('Should store the token information', async () => {
                await inputAdded.handle(logErc20TransferV2, block, ctx);
                expect(mockTokenStorage.size).toBe(1);
                const [token] = mockTokenStorage.values();

                expect(token).toEqual({
                    chain: expectedChain,
                    decimals: decimals,
                    id: `${sepolia.id}-0x813ae0539daf858599a1b2a7083380542a7b1bb5`,
                    address: '0x813ae0539daf858599a1b2a7083380542a7b1bb5',
                    name: name,
                    symbol: symbol,
                });
            });

            test('should store the deposit information', async () => {
                await inputAdded.handle(logErc20TransferV2, block, ctx);

                expect(mockDepositStorage.size).toBe(1);
                const [deposit] = mockDepositStorage.values();

                expect(deposit).toEqual({
                    chain: expectedChain,
                    id: `${sepolia.id}-0x4ca2f6935200b9a782a78f408f640f17b29809d8-v2-10`,
                    amount: 111000000000000000n,
                    from: '0xf9e958241c1ca380cfcd50170ec43974bded0bff',
                    token: {
                        id: `${sepolia.id.toString()}-0x813ae0539daf858599a1b2a7083380542a7b1bb5`,
                        address: '0x813ae0539daf858599a1b2a7083380542a7b1bb5',
                        decimals: 18,
                        name: 'Wrapped Ether',
                        symbol: 'WETH',
                        chain: expectedChain,
                    },
                });
            });

            test('should assign the erc20 deposit information correctly into the input', async () => {
                await inputAdded.handle(logErc20TransferV2, block, ctx);

                expect(mockInputStorage.size).toEqual(1);
                const [input] =
                    mockInputStorage.values() as IterableIterator<Input>;

                expect(input.erc20Deposit).toEqual({
                    chain: expectedChain,
                    amount: 111000000000000000n,
                    from: '0xf9e958241c1ca380cfcd50170ec43974bded0bff',
                    id: `${sepolia.id}-0x4ca2f6935200b9a782a78f408f640f17b29809d8-v2-10`,
                    token: {
                        decimals: 18,
                        id: `${sepolia.id}-0x813ae0539daf858599a1b2a7083380542a7b1bb5`,
                        address: '0x813ae0539daf858599a1b2a7083380542a7b1bb5',
                        name: 'Wrapped Ether',
                        symbol: 'WETH',
                        chain: expectedChain,
                    },
                });

                expect(input.erc721Deposit).toBeUndefined;
            });
        });

        describe('ERC-721 deposits', () => {
            const name = 'BrotherNFT';
            const symbol = 'BRUH';

            beforeEach(() => {
                ERC721Mock.prototype.name.mockResolvedValue(name);
                ERC721Mock.prototype.symbol.mockResolvedValue(symbol);
            });

            afterEach(() => {
                vi.clearAllMocks();
            });

            test('should store the token information', async () => {
                await inputAdded.handle(logErc721TransferV2, block, ctx);

                expect(mockNftStorage.size).toBe(1);
                const [token] =
                    mockNftStorage.values() as IterableIterator<NFT>;

                expect(token).toEqual({
                    chain: expectedChain,
                    id: `${sepolia.id}-0x7a3cc9c0408887a030a0354330c36a9cd681aa7e`,
                    address: '0x7a3cc9c0408887a030a0354330c36a9cd681aa7e',
                    name,
                    symbol,
                });
            });

            test('should store the deposit information', async () => {
                await inputAdded.handle(logErc721TransferV2, block, ctx);

                expect(mockErc721DepositStorage.size).toBe(1);
                const [deposit] =
                    mockErc721DepositStorage.values() as IterableIterator<Erc721Deposit>;

                expect(deposit).toEqual({
                    chain: expectedChain,
                    id: `${sepolia.id}-0x4ca2f6935200b9a782a78f408f640f17b29809d8-v2-1`,
                    from: logErc721Transfer.transaction?.from,
                    token: {
                        chain: expectedChain,
                        id: `${sepolia.id}-0x7a3cc9c0408887a030a0354330c36a9cd681aa7e`,
                        address: '0x7a3cc9c0408887a030a0354330c36a9cd681aa7e',
                        name,
                        symbol,
                    },
                    tokenIndex: 1n,
                });
            });

            test('should assign the erc721 deposit information correctly into the input', async () => {
                await inputAdded.handle(logErc721TransferV2, block, ctx);

                expect(mockInputStorage.size).toBe(1);
                const [input] =
                    mockInputStorage.values() as IterableIterator<Input>;

                expect(input.erc721Deposit).toEqual({
                    chain: expectedChain,
                    from: '0xa074683b5be015f053b5dceb064c41fc9d11b6e5',
                    id: `${sepolia.id}-0x4ca2f6935200b9a782a78f408f640f17b29809d8-v2-1`,
                    token: {
                        chain: expectedChain,
                        id: `${sepolia.id}-0x7a3cc9c0408887a030a0354330c36a9cd681aa7e`,
                        address: '0x7a3cc9c0408887a030a0354330c36a9cd681aa7e',
                        name,
                        symbol,
                    },
                    tokenIndex: 1n,
                });
            });

            test('should handle the absence of name and symbol methods in the ERC-721 contract', async () => {
                ERC721Mock.prototype.name.mockRejectedValue(
                    new Error('No name method implemented on contract'),
                );
                ERC721Mock.prototype.symbol.mockRejectedValue(
                    new Error('No symbol method implemented on contract'),
                );

                await inputAdded.handle(logErc721TransferV2, block, ctx);

                expect(mockInputStorage.size).toBe(1);
                const [input] =
                    mockInputStorage.values() as IterableIterator<Input>;
                expect(input.erc721Deposit?.token).toEqual({
                    id: `${sepolia.id}-0x7a3cc9c0408887a030a0354330c36a9cd681aa7e`,
                    address: '0x7a3cc9c0408887a030a0354330c36a9cd681aa7e',
                    name: null,
                    symbol: null,
                    chain: expectedChain,
                });
            });
        });

        describe('ERC-1155 deposits', () => {
            const tokenAddress = `${sepolia.id}-0x2960f4db2b0993ae5b59bc4a0f5ec7a1767e905e`;

            afterEach(() => {
                vi.clearAllMocks();
            });

            test('should store the token information', async () => {
                expect(mockMultiTokenStorage.size).toBe(0);

                await inputAdded.handle(logErc1155SingleTransferV2, block, ctx);

                expect(mockMultiTokenStorage.size).toBe(1);
                const token = mockMultiTokenStorage.get(tokenAddress);
                expect(token?.id).toEqual(tokenAddress);
                expect(token?.address).toEqual(
                    '0x2960f4db2b0993ae5b59bc4a0f5ec7a1767e905e',
                );
                expect(token?.chain).toEqual({ id: '11155111' });
            });

            test('should store the deposit information for single transfer', async () => {
                const inputId = `${sepolia.id}-0x4ca2f6935200b9a782a78f408f640f17b29809d8-v2-2`;
                expect(mockErc1155DepositStorage.size).toBe(0);
                await inputAdded.handle(logErc1155SingleTransferV2, block, ctx);

                expect(mockErc1155DepositStorage.size).toBe(1);

                const deposit = mockErc1155DepositStorage.get(inputId);

                expect(deposit).toEqual({
                    from: '0xa074683b5be015f053b5dceb064c41fc9d11b6e5',
                    id: inputId,
                    chain: expectedChain,
                    token: {
                        id: `${sepolia.id}-0x2960f4db2b0993ae5b59bc4a0f5ec7a1767e905e`,
                        address: '0x2960f4db2b0993ae5b59bc4a0f5ec7a1767e905e',
                        chain: expectedChain,
                    },
                    transfers: [
                        {
                            amount: 100n,
                            tokenIndex: 0n,
                        },
                    ],
                });
            });

            test('should store the deposit information for batch transfer', async () => {
                const inputId = `${sepolia.id}-0x4ca2f6935200b9a782a78f408f640f17b29809d8-v2-2`;
                expect(mockErc1155DepositStorage.size).toBe(0);
                await inputAdded.handle(logErc1155BatchTransferV2, block, ctx);

                expect(mockErc1155DepositStorage.size).toBe(1);

                const deposit = mockErc1155DepositStorage.get(inputId);

                expect(deposit).toEqual({
                    from: '0xa074683b5be015f053b5dceb064c41fc9d11b6e5',
                    id: inputId,
                    chain: expectedChain,
                    token: {
                        id: `${sepolia.id}-0x2960f4db2b0993ae5b59bc4a0f5ec7a1767e905e`,
                        address: '0x2960f4db2b0993ae5b59bc4a0f5ec7a1767e905e',
                        chain: expectedChain,
                    },
                    transfers: [
                        {
                            amount: 100n,
                            tokenIndex: 1n,
                        },
                        {
                            amount: 200n,
                            tokenIndex: 2n,
                        },
                    ],
                });
            });
        });
    });
});
