import {
    BlockHeader,
    DataHandlerContext,
    EvmBatchProcessor,
    EvmBatchProcessorFields,
    Log as _Log,
    Transaction as _Transaction,
} from '@subsquid/evm-processor';
import { createLogger } from '@subsquid/logger';
import {
    ProcessorConfig,
    SupportedChainId,
    SupportedNetworks,
    eventConfigs,
    networkConfigs,
    processorConfigs,
} from './configs';

const logger = createLogger('sqd:startup');
const USE_CHAIN_ID = process.env.USE_CHAIN_ID as SupportedChainId;
const chainId: SupportedChainId = USE_CHAIN_ID ?? SupportedNetworks.SEPOLIA;
const [name, id] =
    Object.entries(SupportedNetworks).find(([_, id]) => id === chainId) ?? [];

export const config = networkConfigs[chainId];
const processorConfig: ProcessorConfig = processorConfigs.get(chainId) ?? {};

if (!USE_CHAIN_ID) {
    logger.warn(`Environment variable USE_CHAIN_ID not defined.`);
}

logger.info(`Using chain-id:${id} network name: ${name}`);

logger.info(
    `RPC-configured: ${config.chain} Archive-node configured: ${config.archive}`,
);

export const processor = new EvmBatchProcessor()
    .setDataSource({
        archive: config.archive,
        chain: {
            url: config.chain ?? '',
            rateLimit: processorConfig.rateLimit,
            maxBatchCallSize: processorConfig.maxBatchCallSize,
        },
    })
    .setFinalityConfirmation(75)
    .setFields({
        transaction: {
            chainId: true,
            from: true,
            value: true,
            hash: true,
        },
    })
    .setBlockRange({
        from: config.cartesiDAppFactory.block,
    })
    .addLog({
        address: [config.cartesiDAppFactory.address],
        topic0: [eventConfigs.cartesiDAppFactory.applicationCreated],
    })
    .addLog({
        address: [config.inputBox.address],
        topic0: [eventConfigs.inputBox.inputAdded],
    });

export type Fields = EvmBatchProcessorFields<typeof processor>;
export type Block = BlockHeader<Fields>;
export type Log = _Log<Fields>;
export type Transaction = _Transaction<Fields>;
export type ProcessorContext<Store> = DataHandlerContext<Store, Fields>;
