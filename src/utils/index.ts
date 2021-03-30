import BN from 'bn.js'
import BigNumber from 'bignumber.js'
import Web3 from 'web3'
import { useState, useEffect } from 'react'
import numeral from 'numeral'
import { IdeaToken, IdeaMarket } from 'store/ideaMarketsStore'

export { default as TransactionManager } from './TransactionManager'
export { default as useTransactionManager } from './useTransactionManager'
export { getUniswapPath, getUniswapDaiOutputSwap } from './uniswap'
export type { UniswapPairDetails } from './uniswap'

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
  cDai:
    NETWORK === 'rinkeby' || NETWORK === 'test'
      ? '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14'
      : '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
  weth:
    NETWORK === 'rinkeby' || NETWORK === 'test'
      ? '0xc778417E063141139Fce010982780140Aa0cD5Ab'
      : '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
}

export const web3TenPow18 = new BN('10').pow(new BN('18'))
export const web3UintMax = new BN('2').pow(new BN('256')).sub(new BN('1'))
export const bigNumberTenPow18 = new BigNumber('10').pow(new BigNumber('18'))

export const HOUR_SECONDS = 3600
export const DAY_SECONDS = 86400
export const WEEK_SECONDS = 604800
export const MONTH_SECONDS = 2628000
export const YEAR_SECONDS = 31536000

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

export function formatNumberWithCommasAsThousandsSerperator(
  number: string | number
): string {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function calculateIdeaTokenDaiValue(
  token: IdeaToken,
  market: IdeaMarket,
  amount: BN
): BN {
  if (!token || !market || !amount) {
    return new BN('0')
  }

  const FEE_SCALE = new BN('10000')

  const baseCost = market.rawBaseCost
  const priceRise = market.rawPriceRise
  const hatchTokens = market.rawHatchTokens
  const supply = token.rawSupply

  const tradingFeeRate = market.rawTradingFeeRate
  const platformFeeRate = market.rawPlatformFeeRate

  let hatchPrice = new BN('0')
  let updatedAmount = amount
  let updatedSupply = supply

  if (supply.sub(amount) < hatchTokens) {
    if (supply <= hatchTokens) {
      return baseCost.mul(amount).div(web3TenPow18)
    }

    const tokensInHatch = hatchTokens.sub(supply.sub(amount))
    hatchPrice = baseCost.mul(tokensInHatch).div(web3TenPow18)
    updatedAmount = amount.sub(tokensInHatch)
    updatedSupply = supply.sub(hatchTokens)
  } else {
    updatedSupply = supply.sub(hatchTokens)
  }

  const priceAtSupply = baseCost.add(
    priceRise.mul(updatedSupply).div(web3TenPow18)
  )
  const priceAtSupplyMinusAmount = baseCost.add(
    priceRise.mul(updatedSupply.sub(updatedAmount)).div(web3TenPow18)
  )
  const average = priceAtSupply.add(priceAtSupplyMinusAmount).div(new BN('2'))

  const rawPrice = hatchPrice.add(average.mul(updatedAmount).div(web3TenPow18))

  const tradingFee = rawPrice.mul(tradingFeeRate).div(FEE_SCALE)
  const platformFee = rawPrice.mul(platformFeeRate).div(FEE_SCALE)

  return rawPrice.sub(tradingFee).sub(platformFee)
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

export * from './feature-flags'
