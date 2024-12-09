import { beforeEach, describe, expect, test, vi } from 'vitest';

import { sepolia } from 'viem/chains';
import OwnerShipTransferred from '../../src/handlers/OwnershipTransferred';
import { Application, Chain, RollupVersion } from '../../src/model';
import { generateIDFrom } from '../../src/utils';
import { mockModelImplementation } from '../stubs/mocks';
import { block, ctx, logs } from '../stubs/params';

vi.mock('../../src/model/', async (importOriginal) => {
    const actualMods = await importOriginal;
    const Application = vi.fn();
    const Chain = vi.fn();
    const RollupVersion = { v1: 'v1', v2: 'v2' };
    return {
        ...actualMods!,
        Application,
        Chain,
        RollupVersion,
    };
});

describe('ApplicationCreated', () => {
    let ownershipTransferred: OwnerShipTransferred;
    const mockApplicationStorage = new Map<string, Application>();
    const mockChainStorage = new Map<string, Chain>();
    beforeEach(() => {
        ownershipTransferred = new OwnerShipTransferred(
            mockApplicationStorage,
            mockChainStorage,
        );
        mockModelImplementation(Application);
        mockModelImplementation(Chain);

        mockApplicationStorage.clear();
        mockChainStorage.clear();

        vi.clearAllMocks();
    });
    describe('handle', async () => {
        test('should ignore events other than OwnershipTransfered', async () => {
            await ownershipTransferred.handle(logs[0], block, ctx);
            expect(mockApplicationStorage.size).toEqual(0);
            expect(mockChainStorage.size).toEqual(0);
        });

        test('Should transfer the Ownership', async () => {
            const mockApplicationStorage2 = new Map();
            const log = logs[2];
            const appId = generateIDFrom([
                sepolia.id,
                log.transaction?.to,
                RollupVersion.v1,
            ]);

            mockApplicationStorage2.set(appId, {
                id: appId,
                owner: '0xf05d57a5bed2d1b529c56001fc5810cc9afc0335',
                factory: {
                    id: generateIDFrom([
                        sepolia.id,
                        '0x7122cd1221c20892234186facfe8615e6743ab02',
                    ]),
                },
                chain: {
                    id: sepolia.id.toString(),
                },
            });

            const ownerMock = new OwnerShipTransferred(
                mockApplicationStorage2,
                mockChainStorage,
            );

            await ownerMock.handle(logs[2], block, ctx);

            const [app] = Array.from(mockApplicationStorage2.values());

            expect(app).toEqual({
                chain: { id: sepolia.id.toString() },
                factory: {
                    id: generateIDFrom([
                        sepolia.id,
                        '0x7122cd1221c20892234186facfe8615e6743ab02',
                    ]),
                },
                id: appId,
                owner: '0x96ae2ecbfde74b1ec55e9cf626ee80e4f64c8a63',
            });
        });

        test('should find the application in the database and make the ownership transfer', async () => {
            const appId = generateIDFrom([sepolia.id, logs[2].transaction?.to]);
            vi.spyOn(ctx.store, 'get').mockResolvedValueOnce({
                id: appId,
                owner: '0xf05d57a5bed2d1b529c56001fc5810cc9afc0335',
                factory: {
                    id: '0x7122cd1221c20892234186facfe8615e6743ab02',
                },
            } as Application);

            await ownershipTransferred.handle(logs[2], block, ctx);

            expect(mockApplicationStorage.size).toBe(1);

            const app = mockApplicationStorage.get(appId);

            expect(app?.id).toEqual(
                '11155111-0x7122cd1221c20892234186facfe8615e6743ab02',
            );

            expect(app?.owner).toEqual(
                '0x96ae2ecbfde74b1ec55e9cf626ee80e4f64c8a63',
            );
        });
    });
});
