import { EvmBatchProcessor } from '@subsquid/evm-processor';
import { Database, LocalDest } from '@subsquid/file-store';
import { createLogger } from '@subsquid/logger';
import { events as CartesiApplicationFactory } from '../src/abi/CartesiApplicationFactory';
import {
    events as CartesiDAppFactory,
    events,
} from '../src/abi/CartesiDAppFactory';
import {
    CartesiDAppFactoryAddress,
    getConfig,
    RollupsAddressBook,
} from '../src/config';

type Metadata = {
    height: number;
    hash: string;
    addresses: Record<string, string[]>;
};

const logger = createLogger('sqd:preloader:application');

if (!process.env.CHAIN_ID) {
    logger.error(
        'Looks like the CHAIN_ID environment is not set. The supported chain ids are [1, 11155111]',
    );
    throw new Error('ChainId is required to preload the application addresses');
}

const chainId = parseInt(process.env.CHAIN_ID ?? 0);
const config = getConfig(chainId);
const supportV2 = config.v2 !== undefined && config.v2 !== null;

logger.info(`Processing chainId: ${chainId}`);

let processor = new EvmBatchProcessor()
    .setGateway(config.dataSource.archive!)
    .setRpcDataIngestionSettings({ disabled: true })
    .setFinalityConfirmation(config.finalityConfirmation ?? 10)
    .setFields({
        log: {
            topics: true,
        },
    })
    .setBlockRange({
        from: config.from,
    })
    .addLog({
        address: [CartesiDAppFactoryAddress],
        topic0: [CartesiDAppFactory.ApplicationCreated.topic],
    });

if (supportV2) {
    processor = processor.addLog({
        address: [RollupsAddressBook.v2.ApplicationFactory],
        topic0: [CartesiApplicationFactory.ApplicationCreated.topic],
    });
}

const appFilename = `applications-${chainId}.json` as const;

let appsByFactoryAddress: Record<string, string[]> = {};
let applications: string[] = [];
let isInit = false;

const database = new Database({
    tables: {},
    dest: new LocalDest('./assets'),
    chunkSizeMb: Infinity,
    hooks: {
        async onStateRead(dest) {
            if (await dest.exists(appFilename)) {
                let { height, hash, addresses }: Metadata = await dest
                    .readFile(appFilename)
                    .then(JSON.parse);

                if (!isInit) {
                    appsByFactoryAddress = addresses;
                    isInit = true;
                }

                return { height, hash };
            } else {
                return undefined;
            }
        },
        async onStateUpdate(dest, info) {
            let metadata: Metadata = {
                ...info,
                addresses: {
                    ...appsByFactoryAddress,
                },
            };

            await dest.writeFile(appFilename, JSON.stringify(metadata));
        },
    },
});

const addAppAddressFor = (factoryAddress: string, appAddress: string) => {
    const id = appAddress.toLowerCase();
    const list = appsByFactoryAddress[factoryAddress] ?? [];

    list.push(id);
    appsByFactoryAddress[factoryAddress] = list;
};

const ApplicationFactoryAddress = RollupsAddressBook.v2.ApplicationFactory;

processor.run(database, async (ctx) => {
    for (const block of ctx.blocks) {
        for (const log of block.logs) {
            if (
                log.address === CartesiDAppFactoryAddress &&
                log.topics[0] === events.ApplicationCreated.topic
            ) {
                const { application } = events.ApplicationCreated.decode(log);
                addAppAddressFor(CartesiDAppFactoryAddress, application);
                ctx.log.info(`${application} (Application v1) preloaded`);
            } else if (
                log.address === ApplicationFactoryAddress &&
                log.topics[0] ===
                    CartesiApplicationFactory.ApplicationCreated.topic
            ) {
                const { appContract } =
                    CartesiApplicationFactory.ApplicationCreated.decode(log);

                addAppAddressFor(ApplicationFactoryAddress, appContract);

                ctx.log.info(`${appContract} (Application v2) preloaded`);
            }
        }
    }

    ctx.store.setForceFlush(true);

    if (ctx.isHead) {
        ctx.log.info(
            `Block header for chain-id ${chainId} reached. Finishing preloader`,
        );
        process.exit();
    }
});
