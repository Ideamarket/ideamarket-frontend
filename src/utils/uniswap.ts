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
  outputAmountBN: BN,
  tradeType: string
) {
  const quoterContract = useContractStore.getState().quoterContract
  const { path, fees } = await getUniswapPath(
    inputTokenAddress,
    outputTokenAddress,
    tradeType
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
  inputAmountBN: BN,
  tradeType: string
) {
  const quoterContract = useContractStore.getState().quoterContract
  const { path, fees } = await getUniswapPath(
    inputTokenAddress,
    outputTokenAddress,
    tradeType
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
  outputTokenAddress: string,
  tradeType: string
): Promise<UniswapPoolDetails> {
  const wethAddress = NETWORK.getExternalAddresses().weth
  const updatedInputAddress =
    inputTokenAddress === ZERO_ADDRESS ? wethAddress : inputTokenAddress
  const updatedOutputAddress =
    outputTokenAddress === ZERO_ADDRESS ? wethAddress : outputTokenAddress

  // POOL = input token - output token
  const { fee: feeInputOutput, liquidity: liquidityInputOutput } =
    await getHighestLiquidityPool(updatedInputAddress, updatedOutputAddress)

  let directPath = []
  let directFees = []

  // -1 means no direct path found
  if (feeInputOutput !== -1) {
    if (feeInputOutput === FeeAmount.LOW) {
      directPath = [updatedInputAddress, updatedOutputAddress]
      directFees = [FeeAmount.LOW]
      // return { path: directPath, fees: directFees }
    } else if (feeInputOutput === FeeAmount.MEDIUM) {
      directPath = [updatedInputAddress, updatedOutputAddress]
      directFees = [FeeAmount.MEDIUM]
      // return { path: directPath, fees: directFees }
    } else if (feeInputOutput === FeeAmount.HIGH) {
      directPath = [updatedInputAddress, updatedOutputAddress]
      directFees = [FeeAmount.HIGH]
      // return { path: directPath, fees: directFees }
    }
  }

  // Check for 3-hop path: input -> weth -> output

  let threeHopFees = []

  // POOL = input token - WETH
  const { fee: feeInputWeth, liquidity: liquidityInputWeth } =
    await getHighestLiquidityPool(updatedInputAddress, wethAddress)

  if (feeInputWeth === FeeAmount.LOW) {
    threeHopFees.push(FeeAmount.LOW)
  } else if (feeInputWeth === FeeAmount.MEDIUM) {
    threeHopFees.push(FeeAmount.MEDIUM)
  } else if (feeInputWeth === FeeAmount.HIGH) {
    threeHopFees.push(FeeAmount.HIGH)
  }

  // POOL = WETH - output token
  const { fee: feeWethOutput, liquidity: liquidityWethOutput } =
    await getHighestLiquidityPool(wethAddress, updatedOutputAddress)

  if (feeWethOutput === FeeAmount.LOW) {
    threeHopFees.push(FeeAmount.LOW)
  } else if (feeWethOutput === FeeAmount.MEDIUM) {
    threeHopFees.push(FeeAmount.MEDIUM)
  } else if (feeWethOutput === FeeAmount.HIGH) {
    threeHopFees.push(FeeAmount.HIGH)
  }

  const threeHopPath = [updatedInputAddress, wethAddress, updatedOutputAddress]

  // Liquidity of selected token - WETH pool
  const threeHopLiquidity =
    tradeType === 'buy' ? liquidityInputWeth : liquidityWethOutput
  const path = liquidityInputOutput.gte(threeHopLiquidity)
    ? directPath
    : threeHopPath
  const fees = liquidityInputOutput.gte(threeHopLiquidity)
    ? directFees
    : threeHopFees

  return { path, fees }
}

async function getRoute(inputTokenAddress: string) {
  const outputTokenAddress = NETWORK.getExternalAddresses().dai

  const wethAddress = NETWORK.getExternalAddresses().weth
  const updatedInputAddress =
    inputTokenAddress === ZERO_ADDRESS ? wethAddress : inputTokenAddress
  const updatedOutputAddress =
    outputTokenAddress === ZERO_ADDRESS ? wethAddress : outputTokenAddress

  // POOL = input token - output token
  const { poolAddress: directPoolAddress, liquidity: liquidityInputOutput } =
    await getHighestLiquidityPool(updatedInputAddress, updatedOutputAddress)

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

  let directRoute = null

  if (directPoolAddress) {
    // The direct pool exists

    const directPoolContract = getUniswapPoolContract(directPoolAddress)
    const directPool = await getPool(
      directPoolContract,
      inputToken,
      outputToken
    )

    directRoute = new Route([directPool], inputToken, outputToken)
    // return directRoute
  }

  // Check for input -> WETH -> output

  // POOL = input token - WETH
  const {
    fee: feeInputWeth,
    poolAddress: inputWETHPoolAddress,
    liquidity: liquidityInputWeth,
  } = await getHighestLiquidityPool(updatedInputAddress, wethAddress)

  // If no three hop pool, then use direct route
  if (feeInputWeth === -1) {
    return directRoute
  }

  // POOL = WETH - output token
  const { poolAddress: outputWETHPoolAddress } = await getHighestLiquidityPool(
    wethAddress,
    updatedOutputAddress
  )

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

  // If you pass null pool into Route, it will cause error that does not show up in console
  const threeHopRoute =
    !firstPool || !secondPool
      ? null
      : new Route([firstPool, secondPool], inputToken, outputToken)

  return liquidityInputOutput.gte(liquidityInputWeth)
    ? directRoute
    : threeHopRoute
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

async function getPool(
  poolContract,
  tokenA: Token,
  tokenB: Token
): Promise<Pool> {
  if (!poolContract || !poolContract?.options.address) return null

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

async function getPoolImmutables(poolContract) {
  try {
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
  } catch (error) {
    console.error('Failed getting pool immutables', error)
  }
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

type BestPoolInfo = {
  fee: number
  poolAddress: string
  liquidity: BN
}

/**
 * This is useful because we always want to use the pool with most liquidity.
 *
 * @return the fee from the pool that has the highest liquidity or -1 if no pools available
 */
async function getHighestLiquidityPool(
  inputTokenAddress: string,
  outputTokenAddress: string
): Promise<BestPoolInfo> {
  const uniswapFactoryContract =
    useContractStore.getState().uniswapFactoryContract

  const LOW_FEE_ADDRESS = await uniswapFactoryContract.methods
    .getPool(inputTokenAddress, outputTokenAddress, FeeAmount.LOW)
    .call()
  const lowFeeContract = getUniswapPoolContract(LOW_FEE_ADDRESS)
  const { liquidity: lowFeeLiquidity } =
    LOW_FEE_ADDRESS === ZERO_ADDRESS
      ? { liquidity: new BN(0) }
      : await getPoolState(lowFeeContract)

  const MEDIUM_FEE_ADDRESS = await uniswapFactoryContract.methods
    .getPool(inputTokenAddress, outputTokenAddress, FeeAmount.MEDIUM)
    .call()
  const mediumFeeContract = getUniswapPoolContract(MEDIUM_FEE_ADDRESS)
  const { liquidity: mediumFeeLiquidity } =
    MEDIUM_FEE_ADDRESS === ZERO_ADDRESS
      ? { liquidity: new BN(0) }
      : await getPoolState(mediumFeeContract)

  const HIGH_FEE_ADDRESS = await uniswapFactoryContract.methods
    .getPool(inputTokenAddress, outputTokenAddress, FeeAmount.HIGH)
    .call()
  const highFeeContract = getUniswapPoolContract(HIGH_FEE_ADDRESS)
  const { liquidity: highFeeLiquidity } =
    HIGH_FEE_ADDRESS === ZERO_ADDRESS
      ? { liquidity: new BN(0) }
      : await getPoolState(highFeeContract)

  const isDirectPath =
    LOW_FEE_ADDRESS !== ZERO_ADDRESS ||
    MEDIUM_FEE_ADDRESS !== ZERO_ADDRESS ||
    HIGH_FEE_ADDRESS !== ZERO_ADDRESS

  if (!isDirectPath)
    return { fee: -1, poolAddress: null, liquidity: new BN('0') }

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
    return {
      fee: FeeAmount.LOW,
      poolAddress: LOW_FEE_ADDRESS,
      liquidity: lowFeeLiquidity,
    }
  } else if (maxLiquidity.eq(mediumFeeLiquidity)) {
    return {
      fee: FeeAmount.MEDIUM,
      poolAddress: MEDIUM_FEE_ADDRESS,
      liquidity: mediumFeeLiquidity,
    }
  } else if (maxLiquidity.eq(highFeeLiquidity)) {
    return {
      fee: FeeAmount.HIGH,
      poolAddress: HIGH_FEE_ADDRESS,
      liquidity: highFeeLiquidity,
    }
  }

  return { fee: -1, poolAddress: null, liquidity: new BN('0') } // Should never reach here, but just in case return -1
}
