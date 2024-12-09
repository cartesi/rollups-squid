import { abi as InputBoxV2Abi } from '@cartesi/rollups-v2/export/artifacts/contracts/inputs/InputBox.sol/InputBox.json';
import {
    Address,
    encodeAbiParameters,
    encodeFunctionData,
    encodePacked,
    Hex,
    parseAbiParameters,
} from 'viem';
import { evmAdvanceAbi } from '../../src/decoders/evmAdvance';

type ERC721PortalInput = {
    token: Address;
    sender: Address;
    tokenId: bigint;
    execLayerData: Hex;
    baseLayerData: Hex;
};

type ERC1155BatchPortalInput = {
    token: Address;
    sender: Address;
    tokenIds: bigint[];
    values: bigint[];
    execLayerData: Hex;
    baseLayerData: Hex;
};

type ERC1155SinglePortalInput = {
    token: Address;
    sender: Address;
    tokenId: bigint;
    value: bigint;
    execLayerData: Hex;
    baseLayerData: Hex;
};

type ERC20PortalInput = {
    token: Address;
    sender: Address;
    amount: bigint;
    execLayerData: Hex;
};

type EtherPortalInput = {
    sender: Address;
    value: bigint;
    execLayerData: Hex;
};

type EvmAdvanceInput = {
    chainId: bigint;
    appContract: Address;
    msgSender: Address;
    blockNumber: bigint;
    blockTimestamp: bigint;
    prevRandao: bigint;
    index: bigint;
    payload: Hex;
};

const baseExecLayerAbiParameters = parseAbiParameters(
    'bytes baseLayer, bytes execLayer',
);

export const encodeEtherPortalInput = ({
    sender,
    value,
    execLayerData,
}: EtherPortalInput) =>
    encodePacked(
        ['address', 'uint256', 'bytes'],
        [sender, value, execLayerData],
    );

export const encodeErc20PortalInput = ({
    token,
    sender,
    amount,
    execLayerData,
}: ERC20PortalInput) =>
    encodePacked(
        ['address', 'address', 'uint256', 'bytes'],
        [token, sender, amount, execLayerData],
    );

export const encodeErc721PortalInput = ({
    baseLayerData,
    execLayerData,
    sender,
    token,
    tokenId,
}: ERC721PortalInput) => {
    const data = encodeAbiParameters(baseExecLayerAbiParameters, [
        baseLayerData,
        execLayerData,
    ]);

    return encodePacked(
        ['address', 'address', 'uint256', 'bytes'],
        [token, sender, tokenId, data],
    );
};

export const encodeErc1155SingleInput = ({
    baseLayerData,
    execLayerData,
    sender,
    token,
    tokenId,
    value,
}: ERC1155SinglePortalInput) => {
    const data = encodeAbiParameters(baseExecLayerAbiParameters, [
        baseLayerData,
        execLayerData,
    ]);

    return encodePacked(
        ['address', 'address', 'uint256', 'uint256', 'bytes'],
        [token, sender, tokenId, value, data],
    );
};

export const encodeErc1155BatchInput = ({
    baseLayerData,
    execLayerData,
    sender,
    token,
    tokenIds,
    values,
}: ERC1155BatchPortalInput) => {
    const data = encodeAbiParameters(
        parseAbiParameters(
            'uint[] ids, uint[] values, bytes baseLayer, bytes execLayer',
        ),
        [tokenIds, values, baseLayerData, execLayerData],
    );

    return encodePacked(['address', 'address', 'bytes'], [token, sender, data]);
};

const buildInputFor = (
    appContract: Address,
    payload: Hex,
    msgSender: Address,
    index: bigint,
): EvmAdvanceInput => {
    return {
        chainId: 11155111n,
        appContract,
        blockTimestamp: 1691384268n,
        blockNumber: 4040941n,
        index,
        payload,
        msgSender,
        prevRandao: 2n,
    };
};

const encodeWithEvmAdvance = (input: EvmAdvanceInput) =>
    encodeFunctionData({
        abi: evmAdvanceAbi,
        functionName: 'EvmAdvance',
        args: [
            input.chainId,
            input.appContract,
            input.msgSender,
            input.blockNumber,
            input.blockTimestamp,
            input.prevRandao,
            input.index,
            input.payload,
        ],
    });

const inputAddedEvt = InputBoxV2Abi.find(
    (item) => item.type === 'event' && item.name === 'InputAdded',
);

interface BuildInputAddedDataParams {
    appContract: Address;
    payload: Hex;
    index: bigint;
    msgSender: Address;
}

export const buildInputAddedLogData = ({
    appContract,
    index,
    msgSender,
    payload,
}: BuildInputAddedDataParams) => {
    const input = buildInputFor(appContract, payload, msgSender, index);
    const encodedInput = encodeWithEvmAdvance(input);

    return encodeAbiParameters([{ type: 'bytes' }], [encodedInput]);
};
