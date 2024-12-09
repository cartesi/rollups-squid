import { sepolia } from 'viem/chains';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import ApplicationCreated from '../../../src/handlers/v2/ApplicationCreated';
import {
    Application,
    ApplicationFactory,
    Chain,
    RollupVersion,
} from '../../../src/model';
import { generateIDFrom } from '../../../src/utils';
import { mockModelImplementation } from '../../stubs/mocks';
import { block, ctx, logApplicationCreatedV2, logs } from '../../stubs/params';

vi.mock('../../../src/model/', async (importOriginal) => {
    const actualMods = await importOriginal;
    const Application = vi.fn();
    const ApplicationFactory = vi.fn();
    const Chain = vi.fn();
    const RollupVersion = { v1: 'v1', v2: 'v2' };

    return {
        ...actualMods!,
        Application,
        ApplicationFactory,
        Chain,
        RollupVersion,
    };
});

describe('ApplicationCreated v2', () => {
    let applicationCreated: ApplicationCreated;
    const mockFactoryStorage = new Map();
    const mockApplicationStorage = new Map();
    const mockChainStorage = new Map();

    beforeEach(() => {
        applicationCreated = new ApplicationCreated(
            mockFactoryStorage,
            mockApplicationStorage,
            mockChainStorage,
        );

        // Mock models to return simple Object when new Model() is called.
        mockModelImplementation(Application);
        mockModelImplementation(Chain);
        mockModelImplementation(ApplicationFactory);

        mockFactoryStorage.clear();
        mockApplicationStorage.clear();
        mockChainStorage.clear();
        vi.clearAllMocks();
    });

    describe('handle', async () => {
        test('should ignore events that are not of type application-created', async () => {
            await applicationCreated.handle(logs[0], block, ctx);
            expect(mockFactoryStorage.size).toBe(0);
            expect(mockApplicationStorage.size).toBe(0);
        });

        test('should create an chain object after handling application-created event', async () => {
            await applicationCreated.handle(
                logApplicationCreatedV2,
                block,
                ctx,
            );

            expect(mockChainStorage.size).toEqual(1);
            const [chain] = Array.from(mockChainStorage.values());
            expect(chain).toEqual({ id: sepolia.id.toString() });
        });

        test('should throw error when chain-id information is not available in the Log ', async () => {
            try {
                const clonedLog = structuredClone(logApplicationCreatedV2);
                delete clonedLog.transaction?.chainId;
                await applicationCreated.handle(clonedLog, block, ctx);
                expect(true).toEqual('Should not reach that expectation.');
            } catch (error) {
                expect(error.message).toEqual(
                    'Chain id is required to save ApplicationCreated events and related data!',
                );
            }
        });

        test('should create the entities after handling the application-created event', async () => {
            await applicationCreated.handle(
                logApplicationCreatedV2,
                block,
                ctx,
            );

            const factoryId = generateIDFrom([
                sepolia.id,
                logApplicationCreatedV2.address,
            ]);

            const applicationId = generateIDFrom([
                sepolia.id,
                '0xfb92024ec789bb2fbbc5cd1390386843c5fb7694',
                RollupVersion.v2,
            ]);

            expect(mockFactoryStorage.size).toBe(1);
            expect(mockApplicationStorage.size).toBe(1);
            expect(mockFactoryStorage.has(factoryId)).toBe(true);
            expect(mockApplicationStorage.has(applicationId)).toBe(true);

            const [factory] = Array.from(mockFactoryStorage.values());
            const [application] = Array.from(mockApplicationStorage.values());

            expect(factory).toEqual({
                id: factoryId,
                address: logApplicationCreatedV2.address,
                chain: { id: sepolia.id.toString() },
            });
            expect(application).toEqual({
                id: applicationId,
                address: '0xfb92024ec789bb2fbbc5cd1390386843c5fb7694',
                factory: factory,
                owner: '0x590f92fea8df163fff2d7df266364de7ce8f9e16',
                timestamp: 1728693996n,
                chain: { id: sepolia.id.toString() },
                rollupVersion: 'v2',
            });
        });

        test('should set the timestamp in seconds from the block timestamp', async () => {
            await applicationCreated.handle(
                logApplicationCreatedV2,
                block,
                ctx,
            );
            const applicationId = generateIDFrom([
                sepolia.id,
                '0xfb92024ec789bb2fbbc5cd1390386843c5fb7694',
                RollupVersion.v2,
            ]);

            const timestampInSeconds =
                BigInt(logApplicationCreatedV2.block.timestamp) / 1000n;

            const [application] = Array.from(mockApplicationStorage.values());

            expect(application).toEqual({
                factory: {
                    id: '11155111-0x1d4cfbd2622d802a07ceb4c3401bbb455c9dbdc3',
                    address: logApplicationCreatedV2.address,
                    chain: { id: sepolia.id.toString() },
                },
                id: applicationId,
                owner: '0x590f92fea8df163fff2d7df266364de7ce8f9e16',
                timestamp: timestampInSeconds,
                address: '0xfb92024ec789bb2fbbc5cd1390386843c5fb7694',
                chain: { id: sepolia.id.toString() },
                rollupVersion: 'v2',
            });
        });
    });
});
