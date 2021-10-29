import BN from 'bn.js'
import { useContractStore } from 'store/contractStore'
import { ZERO_ADDRESS } from './index'
import { NETWORK } from 'store/networks'

export type UniswapPairDetails = {
  path: Array<string>
  fees: Array<number>
}

export const LOW_POOL_FEE = 500
export const MEDIUM_POOL_FEE = 3000
export const HIGH_POOL_FEE = 10000

/**
 * @param inputTokenAddress The input token address
 * @param outputTokenAddress The output token address
 * @param outputAmountBN The desired output amount
 *
 * @return The required input to get a `outputAmount` from an Uniswap swap
 */
export async function getInputForOutput(
  inputTokenAddress: string,
  outputTokenAddress: string,
  outputAmountBN: BN
) {
  const quoterContract = useContractStore.getState().quoterContract
  const { path, fees } = await getUniswapPath(
    inputTokenAddress,
    outputTokenAddress
  )
  if (path.length === 2 && fees.length === 1) {
    return new BN(
      await quoterContract.methods
        .quoteExactOutputSingle(path[0], path[1], fees[0], outputAmountBN, 0)
        .call()
    )
  } else {
    // Exact Output Multihop Swap requires path to be encoded in reverse
    const encodedPath = encodePath(
      [path[2], path[1], path[0]],
      [fees[1], fees[0]]
    )
    return new BN(
      await quoterContract.methods
        .quoteExactOutput(encodedPath, outputAmountBN)
        .call()
    )
  }
}

/**
 * @param inputTokenAddress The input token address
 * @param outputTokenAddress The output token address
 * @param inputAmountBN The desired input amount
 *
 * @return The output for `inputAmount` for a Uniswap swap
 */
export async function getOutputForInput(
  inputTokenAddress: string,
  outputTokenAddress: string,
  inputAmountBN: BN
) {
  const quoterContract = useContractStore.getState().quoterContract
  const { path, fees } = await getUniswapPath(
    inputTokenAddress,
    outputTokenAddress
  )
  if (path.length === 2 && fees.length === 1) {
    return new BN(
      await quoterContract.methods
        .quoteExactInputSingle(path[0], path[1], fees[0], inputAmountBN, 0)
        .call()
    )
  } else {
    const encodedPath = encodePath(
      [path[0], path[1], path[2]],
      [fees[0], fees[1]]
    )
    return new BN(
      await quoterContract.methods
        .quoteExactInput(encodedPath, inputAmountBN)
        .call()
    )
  }
}

/**
 * @param inputTokenAddress The input token address
 * @param outputTokenAddress The output token address
 *
 * @return The Uniswap path from `inputTokenAddress` to `outputTokenAddress`
 */
export async function getUniswapPath(
  inputTokenAddress: string,
  outputTokenAddress: string
): Promise<UniswapPairDetails> {
  const wethAddress = NETWORK.getExternalAddresses().weth
  const updatedInputAddress =
    inputTokenAddress === ZERO_ADDRESS ? wethAddress : inputTokenAddress
  const updatedOutputAddress =
    outputTokenAddress === ZERO_ADDRESS ? wethAddress : outputTokenAddress

  const uniswapFactoryContract =
    useContractStore.getState().uniswapFactoryContract

  const LOW_FEE_ADDRESS = await uniswapFactoryContract.methods
    .getPool(updatedInputAddress, updatedOutputAddress, LOW_POOL_FEE)
    .call()
  if (LOW_FEE_ADDRESS !== ZERO_ADDRESS) {
    const path = [updatedInputAddress, updatedOutputAddress]
    const fees = [LOW_POOL_FEE]
    return { path, fees }
  }

  const MEDIUM_FEE_ADDRESS = await uniswapFactoryContract.methods
    .getPool(updatedInputAddress, updatedOutputAddress, MEDIUM_POOL_FEE)
    .call()
  if (MEDIUM_FEE_ADDRESS !== ZERO_ADDRESS) {
    const path = [updatedInputAddress, updatedOutputAddress]
    const fees = [MEDIUM_POOL_FEE]
    return { path, fees }
  }

  const HIGH_FEE_ADDRESS = await uniswapFactoryContract.methods
    .getPool(updatedInputAddress, updatedOutputAddress, HIGH_POOL_FEE)
    .call()
  if (HIGH_FEE_ADDRESS !== ZERO_ADDRESS) {
    const path = [updatedInputAddress, updatedOutputAddress]
    const fees = [HIGH_POOL_FEE]
    return { path, fees }
  }

  // Direct path does not exist if we make it here
  // Check for 3-hop path: input -> weth -> output

  let fees = []
  const LOW_FEE_INPUT_WETH_ADDRESS = await uniswapFactoryContract.methods
    .getPool(updatedInputAddress, wethAddress, LOW_POOL_FEE)
    .call()
  const MEDIUM_FEE_INPUT_WETH_ADDRESS = await uniswapFactoryContract.methods
    .getPool(updatedInputAddress, wethAddress, MEDIUM_POOL_FEE)
    .call()
  const HIGH_FEE_INPUT_WETH_ADDRESS = await uniswapFactoryContract.methods
    .getPool(updatedInputAddress, wethAddress, HIGH_POOL_FEE)
    .call()
  if (LOW_FEE_INPUT_WETH_ADDRESS !== ZERO_ADDRESS) {
    fees.push(LOW_POOL_FEE)
  } else if (MEDIUM_FEE_INPUT_WETH_ADDRESS !== ZERO_ADDRESS) {
    fees.push(MEDIUM_POOL_FEE)
  } else if (HIGH_FEE_INPUT_WETH_ADDRESS !== ZERO_ADDRESS) {
    fees.push(HIGH_POOL_FEE)
  } else {
    throw new Error('No input-weth path')
  }

  const LOW_FEE_WETH_OUTPUT_ADDRESS = await uniswapFactoryContract.methods
    .getPool(wethAddress, updatedOutputAddress, LOW_POOL_FEE)
    .call()
  const MEDIUM_FEE_WETH_OUTPUT_ADDRESS = await uniswapFactoryContract.methods
    .getPool(wethAddress, updatedOutputAddress, MEDIUM_POOL_FEE)
    .call()
  const HIGH_FEE_WETH_OUTPUT_ADDRESS = await uniswapFactoryContract.methods
    .getPool(wethAddress, updatedOutputAddress, HIGH_POOL_FEE)
    .call()
  if (LOW_FEE_WETH_OUTPUT_ADDRESS !== ZERO_ADDRESS) {
    fees.push(LOW_POOL_FEE)
  } else if (MEDIUM_FEE_WETH_OUTPUT_ADDRESS !== ZERO_ADDRESS) {
    fees.push(MEDIUM_POOL_FEE)
  } else if (HIGH_FEE_WETH_OUTPUT_ADDRESS !== ZERO_ADDRESS) {
    fees.push(HIGH_POOL_FEE)
  } else {
    throw new Error('No weth-output path')
  }

  const path = [updatedInputAddress, wethAddress, updatedOutputAddress]
  return { path, fees }
}

/**
 *  @param address The address to get the exchange rate of when paired with DAI
 *  @param amountBN The amount of the selected token desired
 *
 * @return string that represents the exchange rate of a pair of tokens multiplied by the amount desired
 */
export async function getExchangeRateProduct(address: string, amountBN: BN) {
  // We need to get the INPUT here because we want to know the DAI amount BEFORE the swap happens
  return await getInputForOutput(
    NETWORK.getExternalAddresses().dai,
    address,
    amountBN
  )
}

// Encode a UniV3 path. Note that pools (and therefore paths) change when you use different fees.
export const encodePath = (path, fees) => {
  const FEE_SIZE = 3

  if (path.length !== fees.length + 1) {
    throw new Error('path/fee lengths do not match')
  }

  let encoded = '0x'
  for (let i = 0; i < fees.length; i++) {
    // 20 byte encoding of the address
    encoded += path[i].slice(2)
    // 3 byte encoding of the fee
    encoded += fees[i].toString(16).padStart(2 * FEE_SIZE, '0')
  }
  // encode the final token
  encoded += path[path.length - 1].slice(2)

  return encoded.toLowerCase()
}
