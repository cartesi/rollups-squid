import { afterEach } from 'node:test';
import { MockInstance, beforeEach, describe, expect, test, vi } from 'vitest';
import { CartesiDAppFactoryAddress, RollupsAddressBook } from '../src/config';
import { createProcessor } from '../src/processor';
import { loadApplications } from '../src/utils';

vi.mock('@subsquid/evm-processor', async () => {
    const actualMods = await vi.importActual('@subsquid/evm-processor');
    const EvmBatchProcessor = vi.fn();

    EvmBatchProcessor.prototype.setDataSource = vi.fn().mockReturnThis();
    EvmBatchProcessor.prototype.setGateway = vi.fn().mockReturnThis();
    EvmBatchProcessor.prototype.setRpcEndpoint = vi.fn().mockReturnThis();
    EvmBatchProcessor.prototype.setFinalityConfirmation = vi
        .fn()
        .mockReturnThis();
    EvmBatchProcessor.prototype.setFields = vi.fn().mockReturnThis();
    EvmBatchProcessor.prototype.setBlockRange = vi.fn().mockReturnThis();
    EvmBatchProcessor.prototype.addLog = vi.fn().mockReturnThis();

    return {
        ...actualMods!,
        EvmBatchProcessor,
    };
});

const sepolia = 11155111;
const mainnet = 1;
const local = 31337;
const optimism = 10;
const optimismSepolia = 11155420;
const base = 8453;
const baseSepolia = 84532;
const arbitrum = 42161;
const arbitrumSepolia = 421614;

describe('Processor creation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    test('Throw error for unsupported chains', () => {
        try {
            const processor = createProcessor(999);
            expect.unreachable('Should not pass createProcessor');
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toEqual('Unsupported chainId: 999');
        }
    });

    test('Required configs for base', () => {
        const processor = createProcessor(base);
        const applicationMetadata = loadApplications(base);

        expect(processor.setGateway).toHaveBeenCalledWith(
            'https://v2.archive.subsquid.io/network/base-mainnet',
        );

        expect(processor.setRpcEndpoint).toHaveBeenCalledWith({
            url: 'https://mainnet.base.org',
        });

        expect(processor.setFinalityConfirmation).toHaveBeenCalledWith(10);
        expect(processor.setFields).toHaveBeenCalledWith({
            transaction: {
                chainId: true,
                from: true,
                hash: true,
                value: true,
            },
        });
        expect(processor.setBlockRange).toHaveBeenCalledWith({
            from: 12987716,
        });

        const addLog = processor.addLog as unknown as MockInstance;

        expect(addLog).toHaveBeenCalledTimes(3);
        expect(addLog.mock.calls[0][0]).toEqual({
            address: ['0x7122cd1221c20892234186facfe8615e6743ab02'],
            topic0: [
                '0xe73165c2d277daf8713fd08b40845cb6bb7a20b2b543f3d35324a475660fcebd',
            ],
        });
        expect(addLog.mock.calls[1][0]).toEqual({
            address: ['0x59b22d57d4f067708ab0c00552767405926dc768'],
            topic0: [
                '0x6aaa400068bf4ca337265e2a1e1e841f66b8597fd5b452fdc52a44bed28a0784',
            ],
            transaction: true,
        });

        expect(addLog.mock.calls[2][0]).toEqual({
            topic0: [
                '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0',
            ],
            transaction: true,
        });
    });

    test('Required configs for base-sepolia', () => {
        const processor = createProcessor(baseSepolia);
        const applicationMetadata = loadApplications(baseSepolia);

        expect(processor.setGateway).toHaveBeenCalledWith(
            'https://v2.archive.subsquid.io/network/base-sepolia',
        );

        expect(processor.setRpcEndpoint).toHaveBeenCalledWith({
            url: 'https://sepolia.base.org',
        });

        expect(processor.setFinalityConfirmation).toHaveBeenCalledWith(10);
        expect(processor.setFields).toHaveBeenCalledWith({
            transaction: {
                chainId: true,
                from: true,
                hash: true,
                value: true,
            },
        });
        expect(processor.setBlockRange).toHaveBeenCalledWith({
            from: 8688714,
        });

        const addLog = processor.addLog as unknown as MockInstance;

        expect(addLog).toHaveBeenCalledTimes(3);
        expect(addLog.mock.calls[0][0]).toEqual({
            address: ['0x7122cd1221c20892234186facfe8615e6743ab02'],
            topic0: [
                '0xe73165c2d277daf8713fd08b40845cb6bb7a20b2b543f3d35324a475660fcebd',
            ],
        });
        expect(addLog.mock.calls[1][0]).toEqual({
            address: ['0x59b22d57d4f067708ab0c00552767405926dc768'],
            topic0: [
                '0x6aaa400068bf4ca337265e2a1e1e841f66b8597fd5b452fdc52a44bed28a0784',
            ],
            transaction: true,
        });

        expect(addLog.mock.calls[2][0]).toEqual({
            topic0: [
                '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0',
            ],
            transaction: true,
        });
    });

    test('Required configs for sepolia', () => {
        const processor = createProcessor(sepolia);
        const applicationMetadata = loadApplications(sepolia);

        expect(processor.setGateway).toHaveBeenCalledWith(
            'https://v2.archive.subsquid.io/network/ethereum-sepolia',
        );

        expect(processor.setRpcEndpoint).toHaveBeenCalledWith({
            url: 'https://rpc.ankr.com/eth_sepolia',
        });

        expect(processor.setFinalityConfirmation).toHaveBeenCalledWith(10);
        expect(processor.setFields).toHaveBeenCalledWith({
            transaction: {
                chainId: true,
                from: true,
                hash: true,
                value: true,
            },
        });
        expect(processor.setBlockRange).toHaveBeenCalledWith({
            from: 3963384,
        });

        const addLog = processor.addLog as unknown as MockInstance;

        expect(addLog).toHaveBeenCalledTimes(6);
        expect(addLog.mock.calls[0][0]).toEqual({
            address: ['0x7122cd1221c20892234186facfe8615e6743ab02'],
            topic0: [
                '0xe73165c2d277daf8713fd08b40845cb6bb7a20b2b543f3d35324a475660fcebd',
            ],
        });
        expect(addLog.mock.calls[1][0]).toEqual({
            address: ['0x59b22d57d4f067708ab0c00552767405926dc768'],
            topic0: [
                '0x6aaa400068bf4ca337265e2a1e1e841f66b8597fd5b452fdc52a44bed28a0784',
            ],
            transaction: true,
        });

        expect(addLog.mock.calls[2][0]).toEqual({
            address: [RollupsAddressBook.v2.ApplicationFactory],
            topic0: [
                '0xe73165c2d277daf8713fd08b40845cb6bb7a20b2b543f3d35324a475660fcebd',
            ],
            range: { from: 6850934 },
        });

        expect(addLog.mock.calls[3][0]).toEqual({
            address: [RollupsAddressBook.v2.InputBox],
            topic0: [
                '0xc05d337121a6e8605c6ec0b72aa29c4210ffe6e5b9cefdd6a7058188a8f66f98',
            ],
            range: { from: 6850934 },
            transaction: true,
        });

        expect(addLog.mock.calls[4][0]).toEqual({
            address: [
                ...applicationMetadata?.addresses[CartesiDAppFactoryAddress]!,
                ...applicationMetadata?.addresses[
                    RollupsAddressBook.v2.ApplicationFactory
                ]!,
            ],
            topic0: [
                '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0',
            ],
            range: {
                from: expect.any(Number),
                to: applicationMetadata?.height,
            },
            transaction: true,
        });

        expect(addLog.mock.calls[5][0]).toEqual({
            topic0: [
                '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0',
            ],
            range: { from: applicationMetadata?.height! + 1 },
            transaction: true,
        });
    });

    test('Required configs for local/anvil', () => {
        const processor = createProcessor(local);

        expect(processor.setGateway).not.toHaveBeenCalled();
        expect(processor.setRpcEndpoint).toHaveBeenCalledWith(
            'http://127.0.0.1:8545',
        );

        expect(processor.setFinalityConfirmation).toHaveBeenCalledWith(1);
        expect(processor.setFields).toHaveBeenCalledWith({
            transaction: {
                chainId: true,
                from: true,
                hash: true,
                value: true,
            },
        });
        expect(processor.setBlockRange).toHaveBeenCalledWith({
            from: 22,
        });

        const addLog = processor.addLog as unknown as MockInstance;

        expect(addLog).toHaveBeenCalledTimes(5);
        expect(addLog.mock.calls[0][0]).toEqual({
            address: ['0x7122cd1221c20892234186facfe8615e6743ab02'],
            topic0: [
                '0xe73165c2d277daf8713fd08b40845cb6bb7a20b2b543f3d35324a475660fcebd',
            ],
        });
        expect(addLog.mock.calls[1][0]).toEqual({
            address: ['0x59b22d57d4f067708ab0c00552767405926dc768'],
            topic0: [
                '0x6aaa400068bf4ca337265e2a1e1e841f66b8597fd5b452fdc52a44bed28a0784',
            ],
            transaction: true,
        });

        expect(addLog.mock.calls[2][0]).toEqual({
            address: [RollupsAddressBook.v2.ApplicationFactory],
            topic0: [
                '0xe73165c2d277daf8713fd08b40845cb6bb7a20b2b543f3d35324a475660fcebd',
            ],
            range: { from: 22 },
        });

        expect(addLog.mock.calls[3][0]).toEqual({
            address: [RollupsAddressBook.v2.InputBox],
            topic0: [
                '0xc05d337121a6e8605c6ec0b72aa29c4210ffe6e5b9cefdd6a7058188a8f66f98',
            ],
            range: { from: 22 },
            transaction: true,
        });

        expect(addLog.mock.calls[4][0]).toEqual({
            topic0: [
                '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0',
            ],
            transaction: true,
        });
    });

    test('Required configs for optimism', () => {
        const processor = createProcessor(optimism);

        expect(processor.setGateway).toHaveBeenCalledWith(
            'https://v2.archive.subsquid.io/network/optimism-mainnet',
        );

        expect(processor.setRpcEndpoint).toHaveBeenCalledWith({
            url: 'https://mainnet.optimism.io',
        });

        expect(processor.setFinalityConfirmation).toHaveBeenCalledWith(10);
        expect(processor.setFields).toHaveBeenCalledWith({
            transaction: {
                chainId: true,
                from: true,
                hash: true,
                value: true,
            },
        });
        expect(processor.setBlockRange).toHaveBeenCalledWith({
            from: 107432991,
        });

        const addLog = processor.addLog as unknown as MockInstance;

        expect(addLog).toHaveBeenCalledTimes(3);
        expect(addLog.mock.calls[0][0]).toEqual({
            address: ['0x7122cd1221c20892234186facfe8615e6743ab02'],
            topic0: [
                '0xe73165c2d277daf8713fd08b40845cb6bb7a20b2b543f3d35324a475660fcebd',
            ],
        });
        expect(addLog.mock.calls[1][0]).toEqual({
            address: ['0x59b22d57d4f067708ab0c00552767405926dc768'],
            topic0: [
                '0x6aaa400068bf4ca337265e2a1e1e841f66b8597fd5b452fdc52a44bed28a0784',
            ],
            transaction: true,
        });

        expect(addLog.mock.calls[2][0]).toEqual({
            topic0: [
                '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0',
            ],
            transaction: true,
        });
    });

    test('Required configs for optimism-sepolia', () => {
        const processor = createProcessor(optimismSepolia);

        expect(processor.setGateway).toHaveBeenCalledWith(
            'https://v2.archive.subsquid.io/network/optimism-sepolia',
        );

        expect(processor.setRpcEndpoint).toHaveBeenCalledWith({
            url: 'https://sepolia.optimism.io',
        });

        expect(processor.setFinalityConfirmation).toHaveBeenCalledWith(10);
        expect(processor.setFields).toHaveBeenCalledWith({
            transaction: {
                chainId: true,
                from: true,
                hash: true,
                value: true,
            },
        });
        expect(processor.setBlockRange).toHaveBeenCalledWith({
            from: 5393079,
        });

        const addLog = processor.addLog as unknown as MockInstance;

        expect(addLog).toHaveBeenCalledTimes(3);
        expect(addLog.mock.calls[0][0]).toEqual({
            address: ['0x7122cd1221c20892234186facfe8615e6743ab02'],
            topic0: [
                '0xe73165c2d277daf8713fd08b40845cb6bb7a20b2b543f3d35324a475660fcebd',
            ],
        });
        expect(addLog.mock.calls[1][0]).toEqual({
            address: ['0x59b22d57d4f067708ab0c00552767405926dc768'],
            topic0: [
                '0x6aaa400068bf4ca337265e2a1e1e841f66b8597fd5b452fdc52a44bed28a0784',
            ],
            transaction: true,
        });

        expect(addLog.mock.calls[2][0]).toEqual({
            topic0: [
                '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0',
            ],
            transaction: true,
        });
    });

    test('Required configs for arbitrum', () => {
        const processor = createProcessor(arbitrum);

        expect(processor.setGateway).toHaveBeenCalledWith(
            'https://v2.archive.subsquid.io/network/arbitrum-one',
        );

        expect(processor.setRpcEndpoint).toHaveBeenCalledWith({
            url: 'https://arb1.arbitrum.io/rpc',
        });

        expect(processor.setFinalityConfirmation).toHaveBeenCalledWith(10);
        expect(processor.setFields).toHaveBeenCalledWith({
            transaction: {
                chainId: true,
                from: true,
                hash: true,
                value: true,
            },
        });
        expect(processor.setBlockRange).toHaveBeenCalledWith({
            from: 115470622,
        });

        const addLog = processor.addLog as unknown as MockInstance;

        expect(addLog).toHaveBeenCalledTimes(3);
        expect(addLog.mock.calls[0][0]).toEqual({
            address: ['0x7122cd1221c20892234186facfe8615e6743ab02'],
            topic0: [
                '0xe73165c2d277daf8713fd08b40845cb6bb7a20b2b543f3d35324a475660fcebd',
            ],
        });
        expect(addLog.mock.calls[1][0]).toEqual({
            address: ['0x59b22d57d4f067708ab0c00552767405926dc768'],
            topic0: [
                '0x6aaa400068bf4ca337265e2a1e1e841f66b8597fd5b452fdc52a44bed28a0784',
            ],
            transaction: true,
        });

        expect(addLog.mock.calls[2][0]).toEqual({
            topic0: [
                '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0',
            ],
            transaction: true,
        });
    });

    test('Required configs for arbitrum sepolia', () => {
        const processor = createProcessor(arbitrumSepolia);

        expect(processor.setGateway).toHaveBeenCalledWith(
            'https://v2.archive.subsquid.io/network/arbitrum-sepolia',
        );

        expect(processor.setRpcEndpoint).toHaveBeenCalledWith({
            url: 'https://sepolia-rollup.arbitrum.io/rpc',
        });

        expect(processor.setFinalityConfirmation).toHaveBeenCalledWith(10);
        expect(processor.setFields).toHaveBeenCalledWith({
            transaction: {
                chainId: true,
                from: true,
                hash: true,
                value: true,
            },
        });
        expect(processor.setBlockRange).toHaveBeenCalledWith({
            from: 2838409,
        });

        const addLog = processor.addLog as unknown as MockInstance;

        expect(addLog).toHaveBeenCalledTimes(3);
        expect(addLog.mock.calls[0][0]).toEqual({
            address: ['0x7122cd1221c20892234186facfe8615e6743ab02'],
            topic0: [
                '0xe73165c2d277daf8713fd08b40845cb6bb7a20b2b543f3d35324a475660fcebd',
            ],
        });
        expect(addLog.mock.calls[1][0]).toEqual({
            address: ['0x59b22d57d4f067708ab0c00552767405926dc768'],
            topic0: [
                '0x6aaa400068bf4ca337265e2a1e1e841f66b8597fd5b452fdc52a44bed28a0784',
            ],
            transaction: true,
        });

        expect(addLog.mock.calls[2][0]).toEqual({
            topic0: [
                '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0',
            ],
            transaction: true,
        });
    });

    test('Required configs for mainnet', () => {
        const processor = createProcessor(mainnet);
        const applicationMetadata = loadApplications(mainnet);

        expect(processor.setGateway).toHaveBeenCalledWith(
            'https://v2.archive.subsquid.io/network/ethereum-mainnet',
        );

        expect(processor.setRpcEndpoint).toHaveBeenCalledWith({
            url: 'https://rpc.ankr.com/eth',
        });

        expect(processor.setFinalityConfirmation).toHaveBeenCalledWith(10);
        expect(processor.setFields).toHaveBeenCalledWith({
            transaction: {
                chainId: true,
                from: true,
                hash: true,
                value: true,
            },
        });
        expect(processor.setBlockRange).toHaveBeenCalledWith({
            from: 17784733,
        });

        const addLog = processor.addLog as unknown as MockInstance;

        expect(addLog).toHaveBeenCalledTimes(4);
        expect(addLog.mock.calls[0][0]).toEqual({
            address: ['0x7122cd1221c20892234186facfe8615e6743ab02'],
            topic0: [
                '0xe73165c2d277daf8713fd08b40845cb6bb7a20b2b543f3d35324a475660fcebd',
            ],
        });
        expect(addLog.mock.calls[1][0]).toEqual({
            address: ['0x59b22d57d4f067708ab0c00552767405926dc768'],
            topic0: [
                '0x6aaa400068bf4ca337265e2a1e1e841f66b8597fd5b452fdc52a44bed28a0784',
            ],
            transaction: true,
        });

        expect(addLog.mock.calls[2][0]).toEqual({
            address: applicationMetadata?.addresses[CartesiDAppFactoryAddress],
            topic0: [
                '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0',
            ],
            range: {
                from: expect.any(Number),
                to: applicationMetadata?.height,
            },
            transaction: true,
        });

        expect(addLog.mock.calls[3][0]).toEqual({
            topic0: [
                '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0',
            ],
            range: {
                from: applicationMetadata?.height! + 1,
            },
            transaction: true,
        });
    });

    test('Set correct chain for sepolia set on environment var', () => {
        const myRPCNodeURL = 'https://my-custom-sepolia-node/v3/api';
        vi.stubEnv('RPC_URL_11155111', myRPCNodeURL);

        const processor = createProcessor(sepolia);

        expect(processor.setGateway).toHaveBeenCalledWith(
            'https://v2.archive.subsquid.io/network/ethereum-sepolia',
        );

        expect(processor.setRpcEndpoint).toHaveBeenCalledWith({
            url: 'https://my-custom-sepolia-node/v3/api',
        });
    });

    test('Set correct chain for mainnet set on environment var', () => {
        const myRPCNodeURL = 'https://my-custom-mainnet-node/v3/api';
        vi.stubEnv('RPC_URL_1', myRPCNodeURL);

        const processor = createProcessor(mainnet);

        expect(processor.setGateway).toHaveBeenCalledWith(
            'https://v2.archive.subsquid.io/network/ethereum-mainnet',
        );

        expect(processor.setRpcEndpoint).toHaveBeenCalledWith({
            url: 'https://my-custom-mainnet-node/v3/api',
        });
    });

    test('Set correct chain for local/anvil set on environment var', () => {
        const myRPCNodeURL = 'https://my-custom-local-node:9000';
        vi.stubEnv('RPC_URL_31337', myRPCNodeURL);

        const processor = createProcessor(local);

        expect(processor.setRpcEndpoint).toHaveBeenCalledWith(
            'https://my-custom-local-node:9000',
        );
    });

    test('Set correct chain for Base set on environment var', () => {
        const myRPCNodeURL = 'https://my-custom-node/v3/api';
        vi.stubEnv('RPC_URL_8453', myRPCNodeURL);

        const processor = createProcessor(base);

        expect(processor.setGateway).toHaveBeenCalledWith(
            'https://v2.archive.subsquid.io/network/base-mainnet',
        );

        expect(processor.setRpcEndpoint).toHaveBeenCalledWith({
            url: 'https://my-custom-node/v3/api',
        });
    });

    test('Set correct chain for Base Sepolia set on environment var', () => {
        const myRPCNodeURL = 'https://my-custom-node/v3/api';
        vi.stubEnv('RPC_URL_84532', myRPCNodeURL);

        const processor = createProcessor(baseSepolia);

        expect(processor.setGateway).toHaveBeenCalledWith(
            'https://v2.archive.subsquid.io/network/base-sepolia',
        );

        expect(processor.setRpcEndpoint).toHaveBeenCalledWith({
            url: 'https://my-custom-node/v3/api',
        });
    });

    test('Set correct chain for Optimism set on environment var', () => {
        const myRPCNodeURL = 'https://my-custom-node/v3/api';
        vi.stubEnv('RPC_URL_10', myRPCNodeURL);

        const processor = createProcessor(optimism);

        expect(processor.setGateway).toHaveBeenCalledWith(
            'https://v2.archive.subsquid.io/network/optimism-mainnet',
        );

        expect(processor.setRpcEndpoint).toHaveBeenCalledWith({
            url: 'https://my-custom-node/v3/api',
        });
    });

    test('Set correct chain for Optimism Sepolia set on environment var', () => {
        const myRPCNodeURL = 'https://my-custom-node/v3/api';
        vi.stubEnv('RPC_URL_11155420', myRPCNodeURL);

        const processor = createProcessor(optimismSepolia);

        expect(processor.setGateway).toHaveBeenCalledWith(
            'https://v2.archive.subsquid.io/network/optimism-sepolia',
        );

        expect(processor.setRpcEndpoint).toHaveBeenCalledWith({
            url: 'https://my-custom-node/v3/api',
        });
    });

    test('Set correct chain for Arbitrum set on environment var', () => {
        const myRPCNodeURL = 'https://my-custom-node/v3/api';
        vi.stubEnv('RPC_URL_42161', myRPCNodeURL);

        const processor = createProcessor(arbitrum);

        expect(processor.setGateway).toHaveBeenCalledWith(
            'https://v2.archive.subsquid.io/network/arbitrum-one',
        );

        expect(processor.setRpcEndpoint).toHaveBeenCalledWith({
            url: 'https://my-custom-node/v3/api',
        });
    });

    test('Set correct chain for Arbitrum Sepolia set on environment var', () => {
        const myRPCNodeURL = 'https://my-custom-node/v3/api';
        vi.stubEnv('RPC_URL_421614', myRPCNodeURL);

        const processor = createProcessor(arbitrumSepolia);

        expect(processor.setGateway).toHaveBeenCalledWith(
            'https://v2.archive.subsquid.io/network/arbitrum-sepolia',
        );

        expect(processor.setRpcEndpoint).toHaveBeenCalledWith({
            url: 'https://my-custom-node/v3/api',
        });
    });
});
