import { Chain } from '@subsquid/evm-processor/lib/interfaces/chain';
import { Logger } from '@subsquid/logger';
import { Store } from '@subsquid/typeorm-store';
import { encodeAbiParameters } from 'viem';
import { sepolia } from 'viem/chains';
import { vi } from 'vitest';
import {
    CartesiDAppFactoryAddress,
    ERC20PortalAddress,
    InputBoxAddress,
    RollupsAddressBook,
} from '../../src/config';
import { Input, RollupVersion } from '../../src/model';
import { BlockData, Log } from '../../src/processor';
import { generateIDFrom } from '../../src/utils';
import {
    buildInputAddedLogData,
    encodeErc1155BatchInput,
    encodeErc1155SingleInput,
    encodeErc20PortalInput,
    encodeErc721PortalInput,
} from './utils';

vi.mock('@subsquid/logger', async (importOriginal) => {
    const actualMods = await importOriginal;
    const Logger = vi.fn();
    Logger.prototype.warn = vi.fn();
    Logger.prototype.info = vi.fn();
    Logger.prototype.error = vi.fn();
    return {
        ...actualMods!,
        Logger,
    };
});

vi.mock('@subsquid/typeorm-store', async (importOriginal) => {
    const actualMods = await importOriginal;
    const Store = vi.fn();
    Store.prototype.get = vi.fn();
    return {
        ...actualMods!,
        Store,
    };
});

const dappAddress = '0x4cA2f6935200b9a782A78f408F640F17B29809d8';
const payload =
    '0x494e5345525420494e544f20636572746966696572202056414c554553202827307866434432423566316346353562353643306632323464614439394331346234454530393237346433272c3130202c273078664344324235663163463535623536433066323234646144393943313462344545303932373464332729';

export const input = {
    id: '0x60a7048c3136293071605a4eaffef49923e981cc-0',
    chain: {
        id: sepolia.id.toString(),
    },
    application: {
        id: '0x60a7048c3136293071605a4eaffef49923e981cc',
        timestamp: 1696281168n,
        owner: null,
        factory: null,
        inputs: [],
        chain: {
            id: sepolia.id.toString(),
        },
        address: '0x60a7048c3136293071605a4eaffef49923e981cc',
        rollupVersion: RollupVersion.v1,
    },
    index: 1,
    msgSender: ERC20PortalAddress,
    payload: payload,
    timestamp: 1691384268n,
    blockNumber: 4040941n,
    blockHash:
        '0xce6a0d404b4201b3bd4fb8309df0b6a64f6a5d7b71fa89bf2737d4574c58b32f',
    erc721Deposit: null,
    erc20Deposit: null,
    erc1155Deposit: null,
    transactionHash:
        '0x6a3d76983453c0f74188bd89e01576c35f9d9b02daecdd49f7171aeb2bd3dc78',
} satisfies Input;

export const logApplicationCreatedV2: Log = {
    id: '0006859373-c8732-000014',
    logIndex: 14,
    transactionIndex: 10,
    address: '0x1d4cfbd2622d802a07ceb4c3401bbb455c9dbdc3',
    data: '0x000000000000000000000000590f92fea8df163fff2d7df266364de7ce8f9e169f24c52e0fcd1ac696d00405c3bd5adc558c48936919ac5ab3718fcb7d70f93f000000000000000000000000fb92024ec789bb2fbbc5cd1390386843c5fb7694',
    topics: [
        '0xe73165c2d277daf8713fd08b40845cb6bb7a20b2b543f3d35324a475660fcebd',
        '0x0000000000000000000000004821e772f7e84abd6cfd63cdb3ca098807d8ee0a',
    ],
    // @ts-ignore
    block: {
        id: '0006859373-c8732',
        height: 6859373,
        hash: '0xc8732c84ececbcf7a96881cd7ec30e3409e6ba66404b2ebd89e271517c399d8d',
        parentHash:
            '0x04aab6d11d9cb2c00b33b37612a34137bb9e1d3c26d8ef1fd0f9dddd6cd2b471',
        timestamp: 1728693996000,
    },
    // @ts-ignore
    transaction: {
        id: '0006859373-c8732-000010',
        transactionIndex: 10,
        hash: '0x3fa0363695c48298965949aab43b49299559254977908ce696506c00c1f6a75c',
        from: '0x590f92fea8df163fff2d7df266364de7ce8f9e16',
        to: '0x4c11c7f82d6d56a726f9b53dd99af031afd86bb6',
        value: 0n,
        chainId: 11155111,
    },
};

export const logInputAddedV2: Log = {
    id: '0006859416-fd6ca-000028',
    logIndex: 28,
    transactionIndex: 15,
    address: '0x593e5bcf894d6829dd26d0810da7f064406aebb6',
    data: '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000144415bf3630000000000000000000000000000000000000000000000000000000000aa36a7000000000000000000000000fb92024ec789bb2fbbc5cd1390386843c5fb7694000000000000000000000000590f92fea8df163fff2d7df266364de7ce8f9e16000000000000000000000000000000000000000000000000000000000068aa98000000000000000000000000000000000000000000000000000000006709c980094a6affe3aa787280fbdf0a19cdb161b26afdd58fd2672c4615c07ced7f351d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000002bb1100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    topics: [
        '0xc05d337121a6e8605c6ec0b72aa29c4210ffe6e5b9cefdd6a7058188a8f66f98',
        '0x000000000000000000000000fb92024ec789bb2fbbc5cd1390386843c5fb7694',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
    ],
    //@ts-ignore
    block: {
        id: '0006859416-fd6ca',
        height: 6859416,
        hash: '0xfd6ca8df8f19efebb7fea47c9697c37504c2da623039ef928d48a2f547613bd9',
        parentHash:
            '0x1642b6306abb197f45b916aeee19659ed2feb132b2c4d9a0bda89c5e7ff6629a',
        timestamp: 1728694656000,
    },
    // @ts-ignore
    transaction: {
        id: '0006859416-fd6ca-000015',
        transactionIndex: 15,
        hash: '0x0449bc3dcc0f0cdcbd5674823d0102eefd54c1803f0ae6c1812e73bd26d2a4c9',
        from: '0x590f92fea8df163fff2d7df266364de7ce8f9e16',
        to: '0x593e5bcf894d6829dd26d0810da7f064406aebb6',
        value: 0n,
        chainId: 11155111,
    },
};

const fromAddress = '0xf9e958241c1ca380cfcd50170ec43974bded0bff';

export const logErc20TransferV2: Log = {
    ...logInputAddedV2,
    topics: [
        logInputAddedV2.topics[0],
        encodeAbiParameters([{ type: 'address' }], [dappAddress]),
        encodeAbiParameters([{ type: 'uint256' }], [10n]),
    ],
    data: buildInputAddedLogData({
        appContract: dappAddress,
        index: 10n,
        msgSender: RollupsAddressBook.v2.ERC20Portal,
        payload: encodeErc20PortalInput({
            token: '0x813ae0539daf858599a1b2a7083380542a7b1bb5',
            sender: fromAddress,
            amount: 111000000000000000n,
            execLayerData: '0x',
        }),
    }),
};

export const logErc721TransferV2: Log = {
    ...logInputAddedV2,
    topics: [
        logInputAddedV2.topics[0],
        encodeAbiParameters([{ type: 'address' }], [dappAddress]),
        encodeAbiParameters([{ type: 'uint256' }], [10n]),
    ],
    data: buildInputAddedLogData({
        appContract: dappAddress,
        index: 1n,
        msgSender: RollupsAddressBook.v2.ERC721Portal,
        payload: encodeErc721PortalInput({
            token: '0x7a3cc9c0408887a030a0354330c36a9cd681aa7e',
            tokenId: 1n,
            sender: '0xa074683b5be015f053b5dceb064c41fc9d11b6e5',
            baseLayerData: '0x',
            execLayerData: '0x',
        }),
    }),
};

export const logErc1155SingleTransferV2: Log = {
    ...logInputAddedV2,
    topics: [
        logInputAddedV2.topics[0],
        encodeAbiParameters([{ type: 'address' }], [dappAddress]),
        encodeAbiParameters([{ type: 'uint256' }], [2n]),
    ],
    data: buildInputAddedLogData({
        appContract: dappAddress,
        index: 2n,
        msgSender: RollupsAddressBook.v2.ERC1155SinglePortal,
        payload: encodeErc1155SingleInput({
            token: '0x2960f4db2b0993ae5b59bc4a0f5ec7a1767e905e',
            sender: '0xa074683b5be015f053b5dceb064c41fc9d11b6e5',
            tokenId: 0n,
            value: 100n,
            baseLayerData: '0x',
            execLayerData: '0x',
        }),
    }),
};

export const logErc1155BatchTransferV2: Log = {
    ...logInputAddedV2,
    topics: [
        logInputAddedV2.topics[0],
        encodeAbiParameters([{ type: 'address' }], [dappAddress]),
        encodeAbiParameters([{ type: 'uint256' }], [2n]),
    ],
    data: buildInputAddedLogData({
        appContract: dappAddress,
        index: 2n,
        msgSender: RollupsAddressBook.v2.ERC1155BatchPortal,
        payload: encodeErc1155BatchInput({
            token: '0x2960f4db2b0993ae5b59bc4a0f5ec7a1767e905e',
            sender: '0xa074683b5be015f053b5dceb064c41fc9d11b6e5',
            tokenIds: [1n, 2n],
            values: [100n, 200n],
            baseLayerData: '0x',
            execLayerData: '0x',
        }),
    }),
};

export const logErc721Transfer: Log = {
    id: '0004867730-000035-2c78f',
    address: InputBoxAddress,
    logIndex: 35,
    transactionIndex: 24,
    topics: [
        '0x6aaa400068bf4ca337265e2a1e1e841f66b8597fd5b452fdc52a44bed28a0784',
        '0x0000000000000000000000000be010fa7e70d74fa8b6729fe1ae268787298f54',
        '0x0000000000000000000000000000000000000000000000000000000000000001',
    ],
    data: '0x000000000000000000000000237f8dd094c0e47f4236f12b4fa01d6dae89fb87000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c87a3cc9c0408887a030a0354330c36a9cd681aa7ea074683b5be015f053b5dceb064c41fc9d11b6e500000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    // @ts-ignore
    block: {
        id: '0004867730-2c78f',
        height: 4867730,
        hash: '0x2c78fb73f84f2755f65533652983578bcf89a68ad173e756bc631b4d0d242b53',
        parentHash:
            '0x1bb7d54bde1c3dda41c6cc5ab40ad04b855d1ce5dec4175571dd158d3134ec3e',
        timestamp: 1702321200000,
    },
    transaction: {
        chainId: sepolia.id,
        id: '0004867730-000024-2c78f',
        transactionIndex: 24,
        from: '0xa074683b5be015f053b5dceb064c41fc9d11b6e5',
        to: '0x237f8dd094c0e47f4236f12b4fa01d6dae89fb87',
        hash: '0x47c53eeddc2f927ef2a7a3dd9a95bfd70ecfda2c4efdf10a16c48ca98c86b881',
        value: 0n,
        // @ts-ignore
        block: {
            id: '0004867730-2c78f',
            height: 4867730,
            hash: '0x2c78fb73f84f2755f65533652983578bcf89a68ad173e756bc631b4d0d242b53',
            parentHash:
                '0x1bb7d54bde1c3dda41c6cc5ab40ad04b855d1ce5dec4175571dd158d3134ec3e',
            timestamp: 1702321200000,
        },
    },
};

export const logErc1155SingleTransfer: Log = {
    id: '0004867730-000035-2c78f',
    address: InputBoxAddress,
    logIndex: 35,
    transactionIndex: 24,
    topics: [
        '0x6aaa400068bf4ca337265e2a1e1e841f66b8597fd5b452fdc52a44bed28a0784',
        encodeAbiParameters([{ type: 'address' }], [dappAddress]),
        encodeAbiParameters([{ type: 'uint256' }], [783n]),
    ],
    data: '0x0000000000000000000000007cfb0193ca87eb6e48056885e026552c3a941fc4000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001282960f4db2b0993ae5b59bc4a0f5ec7a1767e905ea074683b5be015f053b5dceb064c41fc9d11b6e500000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000989680000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    // @ts-ignore
    block: {
        id: '0004867730-2c78f',
        height: 4867730,
        hash: '0x2c78fb73f84f2755f65533652983578bcf89a68ad173e756bc631b4d0d242b53',
        parentHash:
            '0x1bb7d54bde1c3dda41c6cc5ab40ad04b855d1ce5dec4175571dd158d3134ec3e',
        timestamp: 1702321200000,
    },
    transaction: {
        chainId: sepolia.id,
        id: '0004867730-000024-2c78f',
        transactionIndex: 24,
        from: '0xa074683b5be015f053b5dceb064c41fc9d11b6e5',
        to: '0x7CFB0193Ca87eB6e48056885E026552c3A941FC4',
        hash: '0x47c53eeddc2f927ef2a7a3dd9a95bfd70ecfda2c4efdf10a16c48ca98c86b881',
        value: 0n,
        // @ts-ignore
        block: {
            id: '0004867730-2c78f',
            height: 4867730,
            hash: '0x2c78fb73f84f2755f65533652983578bcf89a68ad173e756bc631b4d0d242b53',
            parentHash:
                '0x1bb7d54bde1c3dda41c6cc5ab40ad04b855d1ce5dec4175571dd158d3134ec3e',
            timestamp: 1702321200000,
        },
    },
};

export const logErc1155BatchTransfer: Log = {
    id: '0004867730-000035-2c78f',
    address: InputBoxAddress,
    logIndex: 35,
    transactionIndex: 24,
    topics: [
        '0x6aaa400068bf4ca337265e2a1e1e841f66b8597fd5b452fdc52a44bed28a0784',
        encodeAbiParameters([{ type: 'address' }], [dappAddress]),
        encodeAbiParameters([{ type: 'uint256' }], [784n]),
    ],
    data: '0x000000000000000000000000edb53860a6b52bbb7561ad596416ee9965b055aa000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000002282960f4db2b0993ae5b59bc4a0f5ec7a1767e905ea074683b5be015f053b5dceb064c41fc9d11b6e500000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000003e800000000000000000000000000000000000000000000000000000000000027100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    // @ts-ignore
    block: {
        id: '0004867730-2c78f',
        height: 4867730,
        hash: '0x2c78fb73f84f2755f65533652983578bcf89a68ad173e756bc631b4d0d242b53',
        parentHash:
            '0x1bb7d54bde1c3dda41c6cc5ab40ad04b855d1ce5dec4175571dd158d3134ec3e',
        timestamp: 1702321200000,
    },
    transaction: {
        chainId: sepolia.id,
        id: '0004867730-000024-2c78f',
        transactionIndex: 24,
        from: '0xa074683b5be015f053b5dceb064c41fc9d11b6e5',
        to: '0xedB53860A6B52bbb7561Ad596416ee9965B055Aa',
        hash: '0x47c53eeddc2f927ef2a7a3dd9a95bfd70ecfda2c4efdf10a16c48ca98c86b881',
        value: 0n,
        // @ts-ignore
        block: {
            id: '0004867730-2c78f',
            height: 4867730,
            hash: '0x2c78fb73f84f2755f65533652983578bcf89a68ad173e756bc631b4d0d242b53',
            parentHash:
                '0x1bb7d54bde1c3dda41c6cc5ab40ad04b855d1ce5dec4175571dd158d3134ec3e',
            timestamp: 1702321200000,
        },
    },
};

export const logErc20Transfer: Log = {
    id: '0004867730-000035-2c78f',
    address: InputBoxAddress,
    logIndex: 31,
    transactionIndex: 24,
    topics: [
        '0x6aaa400068bf4ca337265e2a1e1e841f66b8597fd5b452fdc52a44bed28a0784',
        '0x0000000000000000000000000be010fa7e70d74fa8b6729fe1ae268787298f54',
        '0x0000000000000000000000000000000000000000000000000000000000000001',
    ],
    data: '0x0000000000000000000000009c21aeb2093c32ddbc53eef24b873bdcd1ada1db0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004a01813ae0539daf858599a1b2a7083380542a7b1bb5f9e958241c1ca380cfcd50170ec43974bded0bff000000000000000000000000000000000000000000000000018a59e9721180000000000000000000000000000000000000000000000000',
    // @ts-ignore
    block: {
        id: '0004867730-2c78f',
        height: 4867730,
        hash: '0x2c78fb73f84f2755f65533652983578bcf89a68ad173e756bc631b4d0d242b53',
        parentHash:
            '0x1bb7d54bde1c3dda41c6cc5ab40ad04b855d1ce5dec4175571dd158d3134ec3e',
        timestamp: 1702321200000,
    },
    transaction: {
        chainId: sepolia.id,
        id: '0004867730-000024-2c78f',
        transactionIndex: 24,
        from: '0xF9e958241c1cA380cFcD50170Ec43974bDeD0BfF',
        to: '0xA1C977656F68e1eE2733FF43B83529aF2a5aE7c9',
        hash: '0x47c53eeddc2f927ef2a7a3dd9a95bfd70ecfda2c4efdf10a16c48ca98c86b881',
        value: 0n,
        // @ts-ignore
        block: {
            id: '0004867730-2c78f',
            height: 4867730,
            hash: '0x2c78fb73f84f2755f65533652983578bcf89a68ad173e756bc631b4d0d242b53',
            parentHash:
                '0x1bb7d54bde1c3dda41c6cc5ab40ad04b855d1ce5dec4175571dd158d3134ec3e',
            timestamp: 1702321200000,
        },
    },
};

export const logs: Log[] = [
    {
        id: '0004411683-000001-cae3a',
        logIndex: 1,
        transactionIndex: 1,
        address: InputBoxAddress,
        topics: [
            '0x6aaa400068bf4ca337265e2a1e1e841f66b8597fd5b452fdc52a44bed28a0784',
            '0x0000000000000000000000000be010fa7e70d74fa8b6729fe1ae268787298f54',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
        ],
        data: '0x000000000000000000000000e85fba508e9641103985e9101e5853f79d065e09000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000651b2b3c00000000000000000000000000000000000000000000000000000288e40d88a000000000000000000000000000000000000000000000000000000000651b2b3000000000000000000000000000000000000000000000000000000026dc68ca2400000000000000000000000000000000000000000000000000000000651b2b54000000000000000000000000000000000000000000000000000000002cf06118',
        // @ts-ignore
        block: {
            id: '0004411683-cae3a',
            height: 4411683,
            hash: '0xcae3a527a69528e4711adcb2f79bd41f1589afc909a98e8637f8c9b5e3c73b0b',
            parentHash:
                '0x4805492aba04da1f0846676cb5ddaa0d1400f0c06605ed3d83dc1cfb07e636be',
            timestamp: 1696281564000,
        },
        transaction: {
            id: '0004411683-000001-cae3a',
            transactionIndex: 1,
            from: '0x74d093f6911ac080897c3145441103dabb869307',
            to: '0x95ff8d3ce9dcb7455beb7845143bea84fe5c4f6f',
            hash: '0x1b165c2cd18cc58823fbe598e954458774a48f69249efed9ba5cf243b17d0d89',
            chainId: sepolia.id,
            value: 0n,
            //@ts-ignore
            block: {
                id: '0004411683-cae3a',
                height: 4411683,
                hash: '0xcae3a527a69528e4711adcb2f79bd41f1589afc909a98e8637f8c9b5e3c73b0b',
                parentHash:
                    '0x4805492aba04da1f0846676cb5ddaa0d1400f0c06605ed3d83dc1cfb07e636be',
                timestamp: 1696281564000,
            },
        },
    },
    {
        id: '0004411650-000023-520a3',
        logIndex: 23,
        transactionIndex: 13,
        address: CartesiDAppFactoryAddress,
        topics: [
            '0xe73165c2d277daf8713fd08b40845cb6bb7a20b2b543f3d35324a475660fcebd',
            '0x00000000000000000000000089b7b5d0e61b760f63e3d55d2a57baf974f108cd',
        ],
        data: '0x00000000000000000000000074d093f6911ac080897c3145441103dabb869307aa0a3217fbeee55d5bae9905c77d3204fb2e8716ec0a9d1205c9b602388ae67d0000000000000000000000000be010fa7e70d74fa8b6729fe1ae268787298f54',
        // @ts-ignore
        block: {
            id: '0004411650-520a3',
            height: 4411650,
            hash: '0x520a3652498c69888556abb744fa734751104cd4f9ab1a920377d6eec8647db9',
            parentHash:
                '0xc4df8cd32701923b2c5e228db6a918d41f0b9b125c128714beed9dd16c9f0d21',
            timestamp: 1696281168000,
        },
        transaction: {
            id: '0004411650-000013-520a3',
            transactionIndex: 13,
            from: '0x74d093f6911ac080897c3145441103dabb869307',
            to: '0x7122cd1221c20892234186facfe8615e6743ab02',
            hash: '0x1675b03dcc2e953e1c244f7a416a0644afff560d1e10b86d52c630e5a4d7d0aa',
            chainId: sepolia.id,
            value: 0n,
            // @ts-ignore
            block: {
                id: '0004411650-520a3',
                height: 4411650,
                hash: '0x520a3652498c69888556abb744fa734751104cd4f9ab1a920377d6eec8647db9',
                parentHash:
                    '0xc4df8cd32701923b2c5e228db6a918d41f0b9b125c128714beed9dd16c9f0d21',
                timestamp: 1696281168000,
            },
        },
    },
    {
        id: '0004412547-000071-ef8d2',
        logIndex: 71,
        transactionIndex: 38,
        address: '0x5a1651482b751c1ecc36acb2fff5f31df24e7683',
        topics: [
            '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x00000000000000000000000096ae2ecbfde74b1ec55e9cf626ee80e4f64c8a63',
        ],
        data: '0x',
        // @ts-ignore
        block: {
            id: '0004412547-ef8d2',
            height: 4412547,
            hash: '0xef8d2ed24f024c5299be89a8cd518f69944c949f281f675f90aa360d108a2003',
            parentHash:
                '0xb73623fba8d50070a0f42eb884a8f28fc56a2af336d9721d3e25615d565b3f85',
            timestamp: 1696292376000,
        },
        transaction: {
            id: '0004412547-000038-ef8d2',
            transactionIndex: 38,
            from: '0x96ae2ecbfde74b1ec55e9cf626ee80e4f64c8a63',
            to: '0x7122cd1221c20892234186facfe8615e6743ab02',
            hash: '0xc4df497a15a4afc64dcdb511be8d282283ddd99fc6b4760c74dbaf0570019aa0',
            chainId: sepolia.id,
            value: 0n,
            // @ts-ignore
            block: {
                id: '0004412547-ef8d2',
                height: 4412547,
                hash: '0xef8d2ed24f024c5299be89a8cd518f69944c949f281f675f90aa360d108a2003',
                parentHash:
                    '0xb73623fba8d50070a0f42eb884a8f28fc56a2af336d9721d3e25615d565b3f85',
                timestamp: 1696292376000,
            },
        },
    },
];

export const block: BlockData = {
    // @ts-ignore Add more properties as necessary.
    header: {
        id: '1234567890',
        height: 12345,
        hash: '0x1234567890abcdef',
        parentHash: '0xabcdef1234567890', // EvmBlock field
        timestamp: 1632297600, // EvmBlock field,
    },
    transactions: [],
    logs,
    traces: [],
    stateDiffs: [],
};

export const token = {
    decimals: 18,
    id: generateIDFrom([
        sepolia.id,
        '0x059c7507b973d1512768c06f32a813bc93d83eb2',
    ]),
    name: 'SimpleERC20',
    symbol: 'SIM20',
};

const consoleSink = vi.fn();
const em = vi.fn();
const logger = new Logger(consoleSink, 'app');

const store = new Store(em);
export const ctx = {
    _chain: {} as unknown as Chain,
    log: logger,
    store: store,
    blocks: [block],
    isHead: false,
};
