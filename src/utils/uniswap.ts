import BN from 'bn.js'
import {
  getERC20Contract,
  getUniswapPoolContract,
  useContractStore,
} from 'store/contractStore'
import { bigNumberTenPow18, ZERO_ADDRESS } from './index'
import { NETWORK } from 'store/networks'
import { Token } from '@uniswap/sdk-core'
import { Route, Pool, FeeAmount } from '@uniswap/v3-sdk'
import BigNumber from 'bignumber.js'

export type UniswapPoolDetails = {
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
  liquidity: BN
  sqrtPriceX96: BigNumber
  tick: number
  observationIndex: number
  observationCardinality: number
  observationCardinalityNext: number
  feeProtocol: number
  unlocked: boolean
}

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
  try {
    const [liquidity, slot] = await Promise.all([
      poolContract.methods.liquidity().call(),
      poolContract.methods.slot0().call(),
    ])

    const liquidityBN = new BN(
      new BigNumber(liquidity).multipliedBy(bigNumberTenPow18).toFixed()
    )

    const PoolState: State = {
      liquidity: liquidityBN,
      sqrtPriceX96: slot[0],
      tick: slot[1],
      observationIndex: slot[2],
      observationCardinality: slot[3],
      observationCardinalityNext: slot[4],
      feeProtocol: slot[5],
      unlocked: slot[6],
    }

    return PoolState
  } catch (error) {
    console.error('Failed getting pool state', error)
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
): Promise<UniswapPoolDetails> {
  const wethAddress = NETWORK.getExternalAddresses().weth
  const updatedInputAddress =
    inputTokenAddress === ZERO_ADDRESS ? wethAddress : inputTokenAddress
  const updatedOutputAddress =
    outputTokenAddress === ZERO_ADDRESS ? wethAddress : outputTokenAddress

  const uniswapFactoryContract =
    useContractStore.getState().uniswapFactoryContract

  const LOW_FEE_ADDRESS = await uniswapFactoryContract.methods
    .getPool(updatedInputAddress, updatedOutputAddress, FeeAmount.LOW)
    .call()
  const lowFeeContract = getUniswapPoolContract(LOW_FEE_ADDRESS)
  const { liquidity: lowFeeLiquidity } =
    LOW_FEE_ADDRESS === ZERO_ADDRESS
      ? { liquidity: new BN(0) }
      : await getPoolState(lowFeeContract)

  const MEDIUM_FEE_ADDRESS = await uniswapFactoryContract.methods
    .getPool(updatedInputAddress, updatedOutputAddress, FeeAmount.MEDIUM)
    .call()
  const mediumFeeContract = getUniswapPoolContract(MEDIUM_FEE_ADDRESS)
  const { liquidity: mediumFeeLiquidity } =
    MEDIUM_FEE_ADDRESS === ZERO_ADDRESS
      ? { liquidity: new BN(0) }
      : await getPoolState(mediumFeeContract)

  const HIGH_FEE_ADDRESS = await uniswapFactoryContract.methods
    .getPool(updatedInputAddress, updatedOutputAddress, FeeAmount.HIGH)
    .call()
  const highFeeContract = getUniswapPoolContract(HIGH_FEE_ADDRESS)
  const { liquidity: highFeeLiquidity } =
    HIGH_FEE_ADDRESS === ZERO_ADDRESS
      ? { liquidity: new BN(0) }
      : await getPoolState(highFeeContract)

  let maxLiquidity = new BN(0) // Helps determine which pool has the highest liquidity. That is the pool to use.
  if (lowFeeLiquidity.gt(mediumFeeLiquidity)) {
    maxLiquidity = lowFeeLiquidity
  } else {
    maxLiquidity = mediumFeeLiquidity
  }
  if (highFeeLiquidity.gt(maxLiquidity)) {
    maxLiquidity = highFeeLiquidity
  }

  if (maxLiquidity.eq(lowFeeLiquidity)) {
    const path = [updatedInputAddress, updatedOutputAddress]
    const fees = [FeeAmount.LOW]
    return { path, fees }
  } else if (maxLiquidity.eq(mediumFeeLiquidity)) {
    const path = [updatedInputAddress, updatedOutputAddress]
    const fees = [FeeAmount.MEDIUM]
    return { path, fees }
  } else if (maxLiquidity.eq(highFeeLiquidity)) {
    const path = [updatedInputAddress, updatedOutputAddress]
    const fees = [FeeAmount.HIGH]
    return { path, fees }
  }

  // Direct path does not exist if we make it here
  // Check for 3-hop path: input -> weth -> output

  let fees = []
  const LOW_FEE_INPUT_WETH_ADDRESS = await uniswapFactoryContract.methods
    .getPool(updatedInputAddress, wethAddress, FeeAmount.LOW)
    .call()
  const lowFeeInputWethContract = getUniswapPoolContract(
    LOW_FEE_INPUT_WETH_ADDRESS
  )
  const { liquidity: lowFeeInputWethLiquidity } =
    LOW_FEE_INPUT_WETH_ADDRESS === ZERO_ADDRESS
      ? { liquidity: new BN(0) }
      : await getPoolState(lowFeeInputWethContract)
  const MEDIUM_FEE_INPUT_WETH_ADDRESS = await uniswapFactoryContract.methods
    .getPool(updatedInputAddress, wethAddress, FeeAmount.MEDIUM)
    .call()
  const mediumFeeInputWethContract = getUniswapPoolContract(
    MEDIUM_FEE_INPUT_WETH_ADDRESS
  )
  const { liquidity: mediumFeeInputWethLiquidity } =
    MEDIUM_FEE_INPUT_WETH_ADDRESS === ZERO_ADDRESS
      ? { liquidity: new BN(0) }
      : await getPoolState(mediumFeeInputWethContract)
  const HIGH_FEE_INPUT_WETH_ADDRESS = await uniswapFactoryContract.methods
    .getPool(updatedInputAddress, wethAddress, FeeAmount.HIGH)
    .call()
  const highFeeInputWethContract = getUniswapPoolContract(
    HIGH_FEE_INPUT_WETH_ADDRESS
  )
  const { liquidity: highFeeInputWethLiquidity } =
    HIGH_FEE_INPUT_WETH_ADDRESS === ZERO_ADDRESS
      ? { liquidity: new BN(0) }
      : await getPoolState(highFeeInputWethContract)

  maxLiquidity = new BN(0) // Helps determine which pool has the highest liquidity. That is the pool to use.
  if (lowFeeInputWethLiquidity.gt(mediumFeeInputWethLiquidity)) {
    maxLiquidity = lowFeeInputWethLiquidity
  } else {
    maxLiquidity = mediumFeeInputWethLiquidity
  }
  if (highFeeInputWethLiquidity.gt(maxLiquidity)) {
    maxLiquidity = highFeeInputWethLiquidity
  }

  if (maxLiquidity.eq(lowFeeInputWethLiquidity)) {
    fees.push(FeeAmount.LOW)
  } else if (maxLiquidity.eq(mediumFeeInputWethLiquidity)) {
    fees.push(FeeAmount.MEDIUM)
  } else if (maxLiquidity.eq(highFeeInputWethLiquidity)) {
    fees.push(FeeAmount.HIGH)
  }

  const LOW_FEE_WETH_OUTPUT_ADDRESS = await uniswapFactoryContract.methods
    .getPool(wethAddress, updatedOutputAddress, FeeAmount.LOW)
    .call()
  const lowFeeWethOutputContract = getUniswapPoolContract(
    LOW_FEE_WETH_OUTPUT_ADDRESS
  )
  const { liquidity: lowFeeWethOutputLiquidity } =
    LOW_FEE_WETH_OUTPUT_ADDRESS === ZERO_ADDRESS
      ? { liquidity: new BN(0) }
      : await getPoolState(lowFeeWethOutputContract)
  const MEDIUM_FEE_WETH_OUTPUT_ADDRESS = await uniswapFactoryContract.methods
    .getPool(wethAddress, updatedOutputAddress, FeeAmount.MEDIUM)
    .call()
  const mediumFeeWethOutputContract = getUniswapPoolContract(
    MEDIUM_FEE_WETH_OUTPUT_ADDRESS
  )
  const { liquidity: mediumFeeWethOutputLiquidity } =
    MEDIUM_FEE_WETH_OUTPUT_ADDRESS === ZERO_ADDRESS
      ? { liquidity: new BN(0) }
      : await getPoolState(mediumFeeWethOutputContract)
  const HIGH_FEE_WETH_OUTPUT_ADDRESS = await uniswapFactoryContract.methods
    .getPool(wethAddress, updatedOutputAddress, FeeAmount.HIGH)
    .call()
  const highFeeWethOutputContract = getUniswapPoolContract(
    HIGH_FEE_WETH_OUTPUT_ADDRESS
  )
  const { liquidity: highFeeWethOutputLiquidity } =
    HIGH_FEE_WETH_OUTPUT_ADDRESS === ZERO_ADDRESS
      ? { liquidity: new BN(0) }
      : await getPoolState(highFeeWethOutputContract)

  maxLiquidity = new BN(0) // Helps determine which pool has the highest liquidity. That is the pool to use.
  if (lowFeeWethOutputLiquidity.gt(mediumFeeWethOutputLiquidity)) {
    maxLiquidity = lowFeeWethOutputLiquidity
  } else {
    maxLiquidity = mediumFeeWethOutputLiquidity
  }
  if (highFeeWethOutputLiquidity.gt(maxLiquidity)) {
    maxLiquidity = highFeeWethOutputLiquidity
  }

  if (maxLiquidity.eq(lowFeeWethOutputLiquidity)) {
    fees.push(FeeAmount.LOW)
  } else if (maxLiquidity.eq(mediumFeeWethOutputLiquidity)) {
    fees.push(FeeAmount.MEDIUM)
  } else if (maxLiquidity.eq(highFeeWethOutputLiquidity)) {
    fees.push(FeeAmount.HIGH)
  }

  const path = [updatedInputAddress, wethAddress, updatedOutputAddress]
  return { path, fees }
}

async function getPool(
  poolContract,
  tokenA: Token,
  tokenB: Token
): Promise<Pool> {
  try {
    const [immutables, state] = await Promise.all([
      getPoolImmutables(poolContract),
      getPoolState(poolContract),
    ])

    return new Pool(
      tokenA,
      tokenB,
      parseInt(immutables.fee as any),
      state.sqrtPriceX96.toString(),
      state.liquidity.toString(),
      parseInt(state.tick as any)
    )
  } catch (error) {
    console.error('Failed getting Pool object', error)
  }
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

  const LOW_FEE_ADDRESS = await uniswapFactoryContract.methods
    .getPool(updatedInputAddress, updatedOutputAddress, FeeAmount.LOW)
    .call()
  const lowFeeContract = getUniswapPoolContract(LOW_FEE_ADDRESS)
  const { liquidity: lowFeeLiquidity } =
    LOW_FEE_ADDRESS === ZERO_ADDRESS
      ? { liquidity: new BN(0) }
      : await getPoolState(lowFeeContract)

  const MEDIUM_FEE_ADDRESS = await uniswapFactoryContract.methods
    .getPool(updatedInputAddress, updatedOutputAddress, FeeAmount.MEDIUM)
    .call()
  const mediumFeeContract = getUniswapPoolContract(MEDIUM_FEE_ADDRESS)
  const { liquidity: mediumFeeLiquidity } =
    MEDIUM_FEE_ADDRESS === ZERO_ADDRESS
      ? { liquidity: new BN(0) }
      : await getPoolState(mediumFeeContract)

  const HIGH_FEE_ADDRESS = await uniswapFactoryContract.methods
    .getPool(updatedInputAddress, updatedOutputAddress, FeeAmount.HIGH)
    .call()
  const highFeeContract = getUniswapPoolContract(HIGH_FEE_ADDRESS)
  const { liquidity: highFeeLiquidity } =
    HIGH_FEE_ADDRESS === ZERO_ADDRESS
      ? { liquidity: new BN(0) }
      : await getPoolState(highFeeContract)

  let maxLiquidity = new BN(0) // Helps determine which pool has the highest liquidity. That is the pool to use.
  if (lowFeeLiquidity.gt(mediumFeeLiquidity)) {
    maxLiquidity = lowFeeLiquidity
  } else {
    maxLiquidity = mediumFeeLiquidity
  }
  if (highFeeLiquidity.gt(maxLiquidity)) {
    maxLiquidity = highFeeLiquidity
  }

  if (maxLiquidity.eq(lowFeeLiquidity)) {
    directPoolAddress = LOW_FEE_ADDRESS
  } else if (maxLiquidity.eq(mediumFeeLiquidity)) {
    directPoolAddress = MEDIUM_FEE_ADDRESS
  } else if (maxLiquidity.eq(highFeeLiquidity)) {
    directPoolAddress = HIGH_FEE_ADDRESS
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
    // The direct pool exists

    const directPoolContract = getUniswapPoolContract(directPoolAddress)
    const directPool = await getPool(
      directPoolContract,
      inputToken,
      outputToken
    )

    return new Route([directPool], inputToken, outputToken)
  } else {
    // The direct pool does not exist, check for input -> WETH -> output

    const LOW_FEE_INPUT_WETH_ADDRESS = await uniswapFactoryContract.methods
      .getPool(updatedInputAddress, wethAddress, FeeAmount.LOW)
      .call()
    const lowFeeInputWethContract = getUniswapPoolContract(
      LOW_FEE_INPUT_WETH_ADDRESS
    )
    const { liquidity: lowFeeInputWethLiquidity } =
      LOW_FEE_INPUT_WETH_ADDRESS === ZERO_ADDRESS
        ? { liquidity: new BN(0) }
        : await getPoolState(lowFeeInputWethContract)
    const MEDIUM_FEE_INPUT_WETH_ADDRESS = await uniswapFactoryContract.methods
      .getPool(updatedInputAddress, wethAddress, FeeAmount.MEDIUM)
      .call()
    const mediumFeeInputWethContract = getUniswapPoolContract(
      MEDIUM_FEE_INPUT_WETH_ADDRESS
    )
    const { liquidity: mediumFeeInputWethLiquidity } =
      MEDIUM_FEE_INPUT_WETH_ADDRESS === ZERO_ADDRESS
        ? { liquidity: new BN(0) }
        : await getPoolState(mediumFeeInputWethContract)
    const HIGH_FEE_INPUT_WETH_ADDRESS = await uniswapFactoryContract.methods
      .getPool(updatedInputAddress, wethAddress, FeeAmount.HIGH)
      .call()
    const highFeeInputWethContract = getUniswapPoolContract(
      HIGH_FEE_INPUT_WETH_ADDRESS
    )
    const { liquidity: highFeeInputWethLiquidity } =
      HIGH_FEE_INPUT_WETH_ADDRESS === ZERO_ADDRESS
        ? { liquidity: new BN(0) }
        : await getPoolState(highFeeInputWethContract)

    const LOW_FEE_WETH_OUTPUT_ADDRESS = await uniswapFactoryContract.methods
      .getPool(wethAddress, updatedOutputAddress, FeeAmount.LOW)
      .call()
    const lowFeeWethOutputContract = getUniswapPoolContract(
      LOW_FEE_WETH_OUTPUT_ADDRESS
    )
    const { liquidity: lowFeeWethOutputLiquidity } =
      LOW_FEE_WETH_OUTPUT_ADDRESS === ZERO_ADDRESS
        ? { liquidity: new BN(0) }
        : await getPoolState(lowFeeWethOutputContract)
    const MEDIUM_FEE_WETH_OUTPUT_ADDRESS = await uniswapFactoryContract.methods
      .getPool(wethAddress, updatedOutputAddress, FeeAmount.MEDIUM)
      .call()
    const mediumFeeWethOutputContract = getUniswapPoolContract(
      MEDIUM_FEE_WETH_OUTPUT_ADDRESS
    )
    const { liquidity: mediumFeeWethOutputLiquidity } =
      MEDIUM_FEE_WETH_OUTPUT_ADDRESS === ZERO_ADDRESS
        ? { liquidity: new BN(0) }
        : await getPoolState(mediumFeeWethOutputContract)
    const HIGH_FEE_WETH_OUTPUT_ADDRESS = await uniswapFactoryContract.methods
      .getPool(wethAddress, updatedOutputAddress, FeeAmount.HIGH)
      .call()
    const highFeeWethOutputContract = getUniswapPoolContract(
      HIGH_FEE_WETH_OUTPUT_ADDRESS
    )
    const { liquidity: highFeeWethOutputLiquidity } =
      HIGH_FEE_WETH_OUTPUT_ADDRESS === ZERO_ADDRESS
        ? { liquidity: new BN(0) }
        : await getPoolState(highFeeWethOutputContract)

    let inputWETHPoolAddress
    let outputWETHPoolAddress

    maxLiquidity = new BN(0) // Helps determine which pool has the highest liquidity. That is the pool to use.
    if (lowFeeInputWethLiquidity.gt(mediumFeeInputWethLiquidity)) {
      maxLiquidity = lowFeeInputWethLiquidity
    } else {
      maxLiquidity = mediumFeeInputWethLiquidity
    }
    if (highFeeInputWethLiquidity.gt(maxLiquidity)) {
      maxLiquidity = highFeeInputWethLiquidity
    }

    if (maxLiquidity.eq(lowFeeInputWethLiquidity)) {
      inputWETHPoolAddress = LOW_FEE_INPUT_WETH_ADDRESS
    } else if (maxLiquidity.eq(mediumFeeInputWethLiquidity)) {
      inputWETHPoolAddress = MEDIUM_FEE_INPUT_WETH_ADDRESS
    } else if (maxLiquidity.eq(highFeeInputWethLiquidity)) {
      inputWETHPoolAddress = HIGH_FEE_INPUT_WETH_ADDRESS
    }

    maxLiquidity = new BN(0) // Helps determine which pool has the highest liquidity. That is the pool to use.
    if (lowFeeWethOutputLiquidity.gt(mediumFeeWethOutputLiquidity)) {
      maxLiquidity = lowFeeWethOutputLiquidity
    } else {
      maxLiquidity = mediumFeeWethOutputLiquidity
    }
    if (highFeeWethOutputLiquidity.gt(maxLiquidity)) {
      maxLiquidity = highFeeWethOutputLiquidity
    }

    if (maxLiquidity.eq(lowFeeWethOutputLiquidity)) {
      outputWETHPoolAddress = LOW_FEE_WETH_OUTPUT_ADDRESS
    } else if (maxLiquidity.eq(mediumFeeWethOutputLiquidity)) {
      outputWETHPoolAddress = MEDIUM_FEE_WETH_OUTPUT_ADDRESS
    } else if (maxLiquidity.eq(highFeeWethOutputLiquidity)) {
      outputWETHPoolAddress = HIGH_FEE_WETH_OUTPUT_ADDRESS
    }

    // The path exists, find the route
    const firstPoolContract = getUniswapPoolContract(inputWETHPoolAddress)
    const secondPoolContract = getUniswapPoolContract(outputWETHPoolAddress)
    let firstPool, secondPool

    await Promise.all([
      (async () => {
        firstPool = await getPool(firstPoolContract, inputToken, wethToken)
      })(),
      (async () => {
        secondPool = await getPool(secondPoolContract, outputToken, wethToken)
      })(),
    ])

    return new Route([firstPool, secondPool], inputToken, outputToken)
  }
}

/**
 *  @param address The address to get the exchange rate of when paired with DAI
 *
 * @return string that represents the exchange rate of a pool of tokens. Ex: 1 ETH = $4315
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
