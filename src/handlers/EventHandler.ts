import { Store } from '@subsquid/typeorm-store';
import {
    Application,
    ApplicationFactory,
    Chain,
    Erc1155Deposit,
    Erc20Deposit,
    Erc721Deposit,
    Input,
    MultiToken,
    NFT,
    Token,
} from '../model';
import { BlockData, Log, ProcessorContext } from '../processor';
import ApplicationCreated from './ApplicationCreated';
import Handler from './Handler';
import InputAdded from './InputAdded';
import OwnershipTransferred from './OwnershipTransferred';
import ApplicationCreatedV2 from './v2/ApplicationCreated';
import InputAddedV2 from './v2/InputAdded';

export default class EventHandler {
    private readonly tokens: Map<string, Token>;
    private readonly deposits: Map<string, Erc20Deposit>;
    private readonly inputs: Map<string, Input>;
    private readonly applications: Map<string, Application>;
    private readonly factories: Map<string, ApplicationFactory>;
    private readonly nfts: Map<string, NFT>;
    private readonly erc721Deposits: Map<string, Erc721Deposit>;
    private readonly multiTokens: Map<string, MultiToken>;
    private readonly erc1155Deposits: Map<string, Erc1155Deposit>;
    private readonly chains: Map<string, Chain>;
    private readonly applicationCreated: Handler;
    private readonly inputAdded: Handler;
    private readonly ownershipTransferred: Handler;
    private readonly applicationCreatedV2: Handler;
    private readonly inputAddedV2: Handler;

    constructor() {
        this.tokens = new Map();
        this.deposits = new Map();
        this.inputs = new Map();
        this.applications = new Map();
        this.factories = new Map();
        this.nfts = new Map();
        this.erc721Deposits = new Map();
        this.multiTokens = new Map();
        this.erc1155Deposits = new Map();
        this.chains = new Map();
        this.applicationCreated = new ApplicationCreated(
            this.factories,
            this.applications,
            this.chains,
        );

        this.inputAdded = new InputAdded(
            this.tokens,
            this.deposits,
            this.applications,
            this.inputs,
            this.nfts,
            this.erc721Deposits,
            this.multiTokens,
            this.erc1155Deposits,
            this.chains,
        );

        this.ownershipTransferred = new OwnershipTransferred(
            this.applications,
            this.chains,
        );

        this.applicationCreatedV2 = new ApplicationCreatedV2(
            this.factories,
            this.applications,
            this.chains,
        );

        this.inputAddedV2 = new InputAddedV2(
            this.tokens,
            this.deposits,
            this.applications,
            this.inputs,
            this.nfts,
            this.erc721Deposits,
            this.multiTokens,
            this.erc1155Deposits,
            this.chains,
        );
    }

    async handle(log: Log, block: BlockData, ctx: ProcessorContext<Store>) {
        await this.applicationCreated.handle(log, block, ctx);
        await this.inputAdded.handle(log, block, ctx);
        await this.ownershipTransferred.handle(log, block, ctx);

        await this.applicationCreatedV2.handle(log, block, ctx);
        await this.inputAddedV2.handle(log, block, ctx);

        return true;
    }

    getValues() {
        return {
            tokens: this.tokens,
            applications: this.applications,
            factories: this.factories,
            deposits: this.deposits,
            inputs: this.inputs,
            nfts: this.nfts,
            erc721Deposits: this.erc721Deposits,
            multiTokens: this.multiTokens,
            erc1155Deposits: this.erc1155Deposits,
            chains: this.chains,
        };
    }

    getTotalHandled() {
        return Object.values(this.getValues()).reduce(
            (acc, entityMap) => acc + entityMap.size,
            0,
        );
    }

    getSummary() {
        return Object.entries(this.getValues())
            .map(
                ([entityName, entityMap]) => `${entityName}: ${entityMap.size}`,
            )
            .join(', ');
    }

    cleanValues() {
        Object.values(this.getValues()).forEach((storage) => storage.clear());
    }
}
