import { DataHandlerContext } from '@subsquid/evm-processor';
import { Store } from '@subsquid/typeorm-store';
import { events } from '../abi/CartesiDApp';
import { Application, Chain, RollupVersion } from '../model';
import { BlockData, Log } from '../processor';
import { generateIDFrom } from '../utils';
import Handler from './Handler';

export default class OwnershipTransferred implements Handler {
    constructor(
        private applicationStorage: Map<string, Application>,
        private chainStorage: Map<string, Chain>,
    ) {}

    async handle(log: Log, _block: BlockData, ctx: DataHandlerContext<Store>) {
        if (log.topics[0] === events.OwnershipTransferred.topic) {
            const chainId = log.transaction?.chainId?.toString();
            const toAddress = log.transaction?.to?.toLowerCase();

            const chain = new Chain({ id: chainId });
            const appIdV1 = generateIDFrom([
                chain.id,
                toAddress,
                RollupVersion.v1,
            ]);

            const appIdV2 = generateIDFrom([
                chain.id,
                toAddress,
                RollupVersion.v2,
            ]);

            const [appV1, appV2] = await Promise.all([
                this.#findApp(appIdV1, ctx),
                this.#findApp(appIdV2, ctx),
            ]);

            this.#updateOwner(chain, appV1, log, ctx);
            this.#updateOwner(chain, appV2, log, ctx);
        }

        return true;
    }

    #updateOwner(
        chain: Chain,
        application: Application | null,
        log: Log,
        ctx: DataHandlerContext<Store>,
    ) {
        if (application) {
            // decode event
            const { newOwner } = events.OwnershipTransferred.decode(log);
            const owner = newOwner.toLowerCase();
            ctx.log.info(
                `${application.id} (Ownership ${application.rollupVersion}) transferred`,
            );
            ctx.log.info(`\t${application.owner} (Current) Owner`);
            ctx.log.info(`\t${owner} (New) Owner`);

            application.owner = owner;
            this.applicationStorage.set(application.id, application);
            this.chainStorage.set(chain.id, chain);
        }
    }

    /**
     * Ignores the Applications created by the input-added event.
     * These apps were not created by the application-created event,
     * therefore the contract does not exist yet, but we are still indexing them.
     * @param appId
     * @param ctx
     * @returns
     */
    async #findApp(appId: string, ctx: DataHandlerContext<Store>) {
        const application =
            this.applicationStorage.get(appId) ??
            (await ctx.store.get(Application, appId));

        if (!application) return null;

        if (!application.factory && !application.owner) return null;

        return application;
    }
}
