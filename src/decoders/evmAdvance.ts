import { Address, decodeFunctionData, Hex, parseAbi } from 'viem';

export interface Data {
    chainId: bigint;
    appContract: Address;
    msgSender: Address;
    blockNumber: bigint;
    blockTimestamp: bigint;
    prevRandao: bigint;
    index: bigint;
    payload: Hex;
}

export const evmAdvanceAbi = parseAbi([
    `function EvmAdvance( uint256 chainId, address appContract,address msgSender, uint256 blockNumber, uint256 blockTimestamp, uint256 prevRandao, uint256 index, bytes calldata payload) external`,
]);

const [evmAdvanceFn] = evmAdvanceAbi;

/**
 * Decode input that is abi encoded using the {@link https://github.com/cartesi/rollups-contracts/blob/v2.0.0-rc.10/contracts/common/Inputs.sol#L19}
 * Function signature
 * @param input
 * @returns
 */
const decodeEvmAdvance = (input: Hex) => {
    const { args } = decodeFunctionData({
        abi: evmAdvanceAbi,
        data: input,
    });

    const decoded: Data = evmAdvanceFn.inputs.reduce((prev, input, index) => {
        return {
            ...prev,
            [input.name]: args[index],
        };
    }, {} as Data);

    return decoded;
};

export default decodeEvmAdvance;
