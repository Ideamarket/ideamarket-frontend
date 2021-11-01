import BN from 'bn.js'
import {
  getERC20Contract,
  getUniswapPairContract,
  useContractStore,
} from 'store/contractStore'
import { ZERO_ADDRESS } from './index'
import { NETWORK } from 'store/networks'
import { Token } from '@uniswap/sdk-core'
import { Route, Pool } from '@uniswap/v3-sdk'
import BigNumber from 'bignumber.js'

export type UniswapPairDetails = {
  path: Array<string>
  fees: Array<number>
}

interface Immutables {
  factory: string
  token0: string
  token1: string
  fee: number
  tickSpacing: number
  maxLiquidityPerTick: BigNumber
}

interface State {
  liquidity: BigNumber
  sqrtPriceX96: BigNumber
  tick: number
  observationIndex: number
  observationCardinality: number
  observationCardinalityNext: number
  feeProtocol: number
  unlocked: boolean
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

async function getPoolImmutables(poolContract) {
  const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] =
    await Promise.all([
      poolContract.methods.factory().call(),
      poolContract.methods.token0().call(),
      poolContract.methods.token1().call(),
      poolContract.methods.fee().call(),
      poolContract.methods.tickSpacing().call(),
      poolContract.methods.maxLiquidityPerTick().call(),
    ])

  const immutables: Immutables = {
    factory,
    token0,
    token1,
    fee,
    tickSpacing,
    maxLiquidityPerTick,
  }
  return immutables
}

async function getPoolState(poolContract) {
  const [liquidity, slot] = await Promise.all([
    poolContract.methods.liquidity().call(),
    poolContract.methods.slot0().call(),
  ])

  const PoolState: State = {
    liquidity,
    sqrtPriceX96: slot[0],
    tick: slot[1],
    observationIndex: slot[2],
    observationCardinality: slot[3],
    observationCardinalityNext: slot[4],
    feeProtocol: slot[5],
    unlocked: slot[6],
  }

  return PoolState
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

async function getPool(
  pairContract,
  tokenA: Token,
  tokenB: Token
): Promise<Pool> {
  const [immutables, state] = await Promise.all([
    getPoolImmutables(pairContract),
    getPoolState(pairContract),
  ])

  return new Pool(
    tokenA,
    tokenB,
    parseInt(immutables.fee as any),
    state.sqrtPriceX96.toString(),
    state.liquidity.toString(),
    parseInt(state.tick as any)
  )
}

async function getRoute(inputTokenAddress: string) {
  const outputTokenAddress = NETWORK.getExternalAddresses().dai
  const uniswapFactoryContract =
    useContractStore.getState().uniswapFactoryContract

  const wethAddress = NETWORK.getExternalAddresses().weth
  const updatedInputAddress =
    inputTokenAddress === ZERO_ADDRESS ? wethAddress : inputTokenAddress
  const updatedOutputAddress =
    outputTokenAddress === ZERO_ADDRESS ? wethAddress : outputTokenAddress

  let directPoolAddress
  const HIGH_FEE_ADDRESS = await uniswapFactoryContract.methods
    .getPool(updatedInputAddress, updatedOutputAddress, HIGH_POOL_FEE)
    .call()
  if (HIGH_FEE_ADDRESS !== ZERO_ADDRESS) {
    directPoolAddress = HIGH_FEE_ADDRESS
  }

  const MEDIUM_FEE_ADDRESS = await uniswapFactoryContract.methods
    .getPool(updatedInputAddress, updatedOutputAddress, MEDIUM_POOL_FEE)
    .call()
  if (MEDIUM_FEE_ADDRESS !== ZERO_ADDRESS) {
    directPoolAddress = MEDIUM_FEE_ADDRESS
  }

  const LOW_FEE_ADDRESS = await uniswapFactoryContract.methods
    .getPool(updatedInputAddress, updatedOutputAddress, LOW_POOL_FEE)
    .call()
  if (LOW_FEE_ADDRESS !== ZERO_ADDRESS) {
    directPoolAddress = LOW_FEE_ADDRESS
  }

  const chainID = NETWORK.getChainID()

  const inputTokenContract = getERC20Contract(updatedInputAddress)
  const outputTokenContract = getERC20Contract(updatedOutputAddress)

  let inputTokenDecimals, outputTokenDecimals
  await Promise.all([
    (async () => {
      inputTokenDecimals = parseInt(
        (await inputTokenContract.methods.decimals().call()).toString()
      )
    })(),
    (async () => {
      outputTokenDecimals = parseInt(
        (await outputTokenContract.methods.decimals().call()).toString()
      )
    })(),
  ])

  const inputToken = new Token(
    chainID,
    updatedInputAddress,
    inputTokenDecimals,
    updatedInputAddress,
    updatedInputAddress
  )
  const wethToken = new Token(
    chainID,
    NETWORK.getExternalAddresses().weth,
    18,
    NETWORK.getExternalAddresses().weth,
    NETWORK.getExternalAddresses().weth
  )
  const outputToken = new Token(
    chainID,
    updatedOutputAddress,
    outputTokenDecimals,
    updatedOutputAddress,
    updatedOutputAddress
  )

  if (directPoolAddress && directPoolAddress !== ZERO_ADDRESS) {
    // The direct pair exists

    const directPairContract = getUniswapPairContract(directPoolAddress)
    const directPair = await getPool(
      directPairContract,
      inputToken,
      outputToken
    )

    return new Route([directPair], inputToken, outputToken)
  } else {
    // The direct pair does not exist, check for input -> WETH -> output

    const LOW_FEE_INPUT_WETH_ADDRESS = await uniswapFactoryContract.methods
      .getPool(updatedInputAddress, wethAddress, LOW_POOL_FEE)
      .call()
    const MEDIUM_FEE_INPUT_WETH_ADDRESS = await uniswapFactoryContract.methods
      .getPool(updatedInputAddress, wethAddress, MEDIUM_POOL_FEE)
      .call()
    const HIGH_FEE_INPUT_WETH_ADDRESS = await uniswapFactoryContract.methods
      .getPool(updatedInputAddress, wethAddress, HIGH_POOL_FEE)
      .call()

    const LOW_FEE_WETH_OUTPUT_ADDRESS = await uniswapFactoryContract.methods
      .getPool(wethAddress, updatedOutputAddress, LOW_POOL_FEE)
      .call()
    const MEDIUM_FEE_WETH_OUTPUT_ADDRESS = await uniswapFactoryContract.methods
      .getPool(wethAddress, updatedOutputAddress, MEDIUM_POOL_FEE)
      .call()
    const HIGH_FEE_WETH_OUTPUT_ADDRESS = await uniswapFactoryContract.methods
      .getPool(wethAddress, updatedOutputAddress, HIGH_POOL_FEE)
      .call()

    let inputWETHPoolAddress
    let outputWETHPoolAddress

    if (LOW_FEE_INPUT_WETH_ADDRESS !== ZERO_ADDRESS)
      inputWETHPoolAddress = LOW_FEE_INPUT_WETH_ADDRESS
    else if (MEDIUM_FEE_INPUT_WETH_ADDRESS !== ZERO_ADDRESS)
      inputWETHPoolAddress = MEDIUM_FEE_INPUT_WETH_ADDRESS
    else if (HIGH_FEE_INPUT_WETH_ADDRESS !== ZERO_ADDRESS)
      inputWETHPoolAddress = HIGH_FEE_INPUT_WETH_ADDRESS

    if (LOW_FEE_WETH_OUTPUT_ADDRESS !== ZERO_ADDRESS)
      outputWETHPoolAddress = LOW_FEE_WETH_OUTPUT_ADDRESS
    else if (MEDIUM_FEE_WETH_OUTPUT_ADDRESS !== ZERO_ADDRESS)
      outputWETHPoolAddress = MEDIUM_FEE_WETH_OUTPUT_ADDRESS
    else if (HIGH_FEE_WETH_OUTPUT_ADDRESS !== ZERO_ADDRESS)
      outputWETHPoolAddress = HIGH_FEE_WETH_OUTPUT_ADDRESS

    // The path exists, find the route
    const firstPairContract = getUniswapPairContract(inputWETHPoolAddress)
    const secondPairContract = getUniswapPairContract(outputWETHPoolAddress)
    let firstPool, secondPool

    await Promise.all([
      (async () => {
        firstPool = await getPool(firstPairContract, inputToken, wethToken)
      })(),
      (async () => {
        secondPool = await getPool(secondPairContract, outputToken, wethToken)
      })(),
    ])

    return new Route([firstPool, secondPool], inputToken, outputToken)
  }
}

/**
 *  @param address The address to get the exchange rate of when paired with DAI
 *
 * @return string that represents the exchange rate of a pair of tokens. Ex: 1 ETH = $4315
 */
export async function getExchangeRate(address: string) {
  // Uniswap references the exchange rate by the variable midPrice
  return (await getRoute(address)).midPrice.toFixed(18)
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
