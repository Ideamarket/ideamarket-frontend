import BN from 'bn.js'
import BigNumber from 'bignumber.js'
import Web3 from 'web3'
import { useState, useEffect } from 'react'
import numeral from 'numeral'
import { IdeaMarket } from 'store/ideaMarketsStore'
import {
  ChainId,
  Token,
  TokenAmount,
  Pair,
  Trade,
  Route,
  TradeType,
} from '@uniswap/sdk'
import { getUniswapPairContract, useContractStore } from 'store/contractStore'

export const NETWORK = process.env.NEXT_PUBLIC_NETWORK
  ? process.env.NEXT_PUBLIC_NETWORK
  : 'rinkeby'

if (!process.env.NEXT_PUBLIC_NETWORK) {
  console.log('WARNING: NEXT_PUBLIC_NETWORK not found. Defaulting to rinkeby')
}

export const addresses = {
  ZERO: '0x0000000000000000000000000000000000000000',
  dai:
    NETWORK === 'rinkeby' || NETWORK === 'test'
      ? '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa'
      : '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  weth:
    NETWORK === 'rinkeby' || NETWORK === 'test'
      ? '0xc778417E063141139Fce010982780140Aa0cD5Ab'
      : '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
}

export const web3TenPow18 = new BN('10').pow(new BN('18'))
export const bigNumberTenPow18 = new BigNumber('10').pow(new BigNumber('18'))

export function web3BNToFloatString(
  bn: BN,
  divideBy: BigNumber,
  decimals: number
): string {
  const converted = new BigNumber(bn.toString())
  const divided = converted.div(divideBy)
  return divided.toFixed(decimals)
}

export function bnToFloatString(
  bn: BigNumber,
  divideBy: BigNumber,
  decimals: number
): string {
  const divided = bn.div(divideBy)
  return divided.toFixed(decimals)
}

export function calculateCurrentPriceBN(
  rawSupply: BN,
  rawBaseCost: BN,
  rawPriceRise: BN,
  rawHatchTokens: BN
): BN {
  if (rawSupply.lt(rawHatchTokens)) {
    return rawBaseCost
  }

  const updatedSupply = rawSupply.sub(rawHatchTokens)
  return rawBaseCost.add(
    rawPriceRise.mul(updatedSupply).div(new BN('10').pow(new BN('18')))
  )
}

export function floatToWeb3BN(float: string, decimals: number) {
  const pow = new BigNumber('10').exponentiatedBy(decimals)
  const big = new BigNumber(float).multipliedBy(pow)
  return new BN(big.toFixed())
}

export function floatToBN(float: string, decimals: number) {
  const pow = new BigNumber('10').exponentiatedBy(decimals)
  const big = new BigNumber(float).multipliedBy(pow)
  return big
}

// https://usehooks.com/useWindowSize
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  })

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

export function scrollToContentWithId(id: string) {
  const element = document.getElementById(id)
  if (!element) {
    return
  }
  const yOffset = 64
  const y = element.getBoundingClientRect().top + window.pageYOffset - yOffset
  window.scrollTo({ behavior: 'smooth', top: y })
}

export function toChecksumedAddress(addr: string): string {
  const web3 = new Web3()
  return web3.utils.toChecksumAddress(addr)
}

export function isAddress(addr: string): boolean {
  try {
    toChecksumedAddress(addr)
    return true
  } catch (e) {
    return false
  }
}

export function removeTrailingZeroesFromNumberString(num: string): string {
  return num.replace(/(?:\.0+|(\.\d+?)0+)$/, '$1')
}

export function formatBigNumber(
  bn: BigNumber,
  decimals: number,
  round: BigNumber.RoundingMode
): string {
  const str = bn.toFormat(decimals, round, {
    decimalSeparator: '.',
    groupSeparator: '',
  })

  return removeTrailingZeroesFromNumberString(str)
}

export function formatNumber(number: string | number): string {
  return numeral(Number(number)).format('0.00a')
}

export function formatNumberInt(number: string | number): string {
  return numeral(Number(number)).format('0 a')
}

export function calculateMaxIdeaTokensBuyable(
  daiBN: BN,
  supplyBN: BN,
  market: IdeaMarket
): BigNumber {
  const tenPow18 = new BigNumber('10').pow(new BigNumber('18'))

  const dai = new BigNumber(daiBN.toString()).div(tenPow18)
  const supply = new BigNumber(supplyBN.toString()).div(tenPow18)

  const hatchTokens = new BigNumber(market.rawHatchTokens.toString()).div(
    tenPow18
  )
  const baseCost = new BigNumber(market.rawBaseCost.toString()).div(tenPow18)
  const priceRise = new BigNumber(market.rawPriceRise.toString()).div(tenPow18)
  const totalFee = new BigNumber(
    market.rawTradingFeeRate.add(market.rawPlatformFeeRate).toString()
  )
  const feeScale = new BigNumber('10000')

  let updatedDai = dai
  let updatedSupply = supply
  let buyable = new BigNumber('0')

  function applyFee(num: BigNumber): BigNumber {
    return num.multipliedBy(feeScale.plus(totalFee)).div(feeScale)
  }

  if (supply.lt(hatchTokens)) {
    // There are still hatch tokens
    const remainingHatch = hatchTokens.minus(supply)
    const costForRemainingHatch = applyFee(
      baseCost.multipliedBy(remainingHatch)
    )

    if (costForRemainingHatch.gte(dai)) {
      // We cannot buy the full remaining hatch
      const hatchBuyable = dai.div(applyFee(baseCost))
      return hatchBuyable.multipliedBy(tenPow18)
    }

    // We can buy the full remaining hatch
    buyable = remainingHatch.multipliedBy(tenPow18)
    updatedDai = dai.minus(costForRemainingHatch)
    updatedSupply = new BigNumber('0')
  } else {
    updatedSupply = supply.minus(hatchTokens)
  }

  // Magic below. This calculates the amount of buyable IdeaTokens for a given Dai input
  const bf = applyFee(baseCost)
  const fr = applyFee(priceRise)
  const frs = applyFee(priceRise.multipliedBy(updatedSupply))
  const b2f = applyFee(baseCost.multipliedBy(baseCost))
  const b2rsf = applyFee(
    baseCost.multipliedBy(2).multipliedBy(priceRise).multipliedBy(updatedSupply)
  )
  const d2r = updatedDai.multipliedBy(2).multipliedBy(priceRise)
  const fr2s2 = applyFee(
    priceRise
      .multipliedBy(priceRise)
      .multipliedBy(updatedSupply)
      .multipliedBy(updatedSupply)
  )

  const root = applyFee(b2f.plus(b2rsf).plus(d2r).plus(fr2s2)).sqrt()
  const numerator = root.minus(bf).minus(frs)
  const denominator = fr
  return buyable.plus(numerator.div(denominator).multipliedBy(tenPow18))
}

export async function getUniswapDaiOutputSwap(
  inputTokenAddress: string,
  inputTokenDecimals: number,
  inputAmount: BN
) {
  const chain = NETWORK === 'mainnet' ? ChainId.MAINNET : ChainId.RINKEBY
  const DAI = new Token(chain, addresses.dai, 18, 'DAI', 'DAI')

  let IN
  if (inputTokenAddress === addresses.ZERO) {
    IN = new Token(chain, addresses.weth, 18, 'WETH', 'WETH')
  } else {
    IN = new Token(
      chain,
      inputTokenAddress,
      inputTokenDecimals,
      'SOME',
      'TOKEN'
    )
  }

  const uniswapFactoryContract = useContractStore.getState()
    .uniswapFactoryContract
  const pairAddress = await uniswapFactoryContract.methods
    .getPair(DAI.address, IN.address)
    .call()

  const pairContract = getUniswapPairContract(pairAddress)

  let token0, token1, reserves
  await Promise.all([
    (async () => {
      token0 = await pairContract.methods.token0().call()
    })(),
    (async () => {
      token1 = await pairContract.methods.token1().call()
    })(),
    (async () => {
      reserves = await pairContract.methods.getReserves().call()
    })(),
  ])

  let pair
  if (token0 === DAI.address) {
    pair = new Pair(
      new TokenAmount(DAI, reserves._reserve0),
      new TokenAmount(IN, reserves._reserve1)
    )
  } else {
    pair = new Pair(
      new TokenAmount(DAI, reserves._reserve1),
      new TokenAmount(IN, reserves._reserve0)
    )
  }

  const route = new Route([pair], IN)
  const trade = new Trade(
    route,
    new TokenAmount(IN, inputAmount.toString()),
    TradeType.EXACT_INPUT
  )
  const outputBN = new BN(
    new BigNumber(trade.outputAmount.toExact())
      .multipliedBy(new BigNumber('10').exponentiatedBy(18))
      .toFixed()
  )

  return outputBN
}
