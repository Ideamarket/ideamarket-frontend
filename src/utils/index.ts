import BN from 'bn.js'
import BigNumber from 'bignumber.js'
import Web3 from 'web3'
import { useState, useEffect } from 'react'
import numeral from 'numeral'
import { IdeaMarket } from 'store/ideaMarketsStore'

export { default as TransactionManager } from './TransactionManager'
export { default as useTransactionManager } from './useTransactionManager'
export { getUniswapPath } from './uniswap'
export type { UniswapPoolDetails } from './uniswap'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const web3TenPow18 = new BN('10').pow(new BN('18'))
export const web3UintMax = new BN('2').pow(new BN('256')).sub(new BN('1'))
export const zeroBN = new BN('0')
export const zeroBigNumber = new BigNumber('0')
export const bigNumberTenPow18 = new BigNumber('10').pow(new BigNumber('18'))
// The amount of IMO that will flow into staking contract in 1 year
export const tenMillionBigNumber = new BigNumber(10000000).multipliedBy(
  new BigNumber('10').exponentiatedBy(18)
)
export const oneBigNumber = new BigNumber(1).multipliedBy(
  new BigNumber('10').exponentiatedBy(18)
)

export const HOUR_SECONDS = 3600
export const DAY_SECONDS = 86400
export const WEEK_SECONDS = 604800
export const MONTH_SECONDS = 2628000
export const YEAR_SECONDS = 31536000

export function web3BNToFloatString(
  bn: BN,
  divideBy: BigNumber,
  decimals: number,
  roundingMode = BigNumber.ROUND_DOWN
): string {
  const converted = new BigNumber(bn.toString())
  const divided = converted.div(divideBy)
  return divided.toFixed(decimals, roundingMode)
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

export function floatToWeb3BN(
  float: string,
  decimals: number,
  round: BigNumber.RoundingMode
) {
  const pow = new BigNumber('10').exponentiatedBy(decimals)
  const big = new BigNumber(float).multipliedBy(pow)
  return new BN(big.toFixed(0, round))
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
  supplyBN: BN,
  market: IdeaMarket,
  amount: BN
): BN {
  if (!supplyBN || !market || !amount) {
    return new BN('0')
  }

  const FEE_SCALE = new BN('10000')

  const baseCost = market.rawBaseCost
  const priceRise = market.rawPriceRise
  const hatchTokens = market.rawHatchTokens

  const tradingFeeRate = market.rawTradingFeeRate
  const platformFeeRate = market.rawPlatformFeeRate

  let hatchPrice = new BN('0')
  let updatedAmount = amount
  let updatedSupply = supplyBN

  if (supplyBN.sub(amount).lt(hatchTokens)) {
    if (supplyBN.lte(hatchTokens)) {
      return baseCost.mul(amount).div(web3TenPow18)
    }

    const tokensInHatch = hatchTokens.sub(supplyBN.sub(amount))
    hatchPrice = baseCost.mul(tokensInHatch).div(web3TenPow18)
    updatedAmount = amount.sub(tokensInHatch)
    updatedSupply = supplyBN.sub(hatchTokens)
  } else {
    updatedSupply = supplyBN.sub(hatchTokens)
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
  const dai = new BigNumber(daiBN.toString()).div(bigNumberTenPow18)
  const supply = new BigNumber(supplyBN.toString()).div(bigNumberTenPow18)

  const hatchTokens = new BigNumber(market.rawHatchTokens.toString()).div(
    bigNumberTenPow18
  )
  const baseCost = new BigNumber(market.rawBaseCost.toString()).div(
    bigNumberTenPow18
  )
  const priceRise = new BigNumber(market.rawPriceRise.toString()).div(
    bigNumberTenPow18
  )
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
      const result = hatchBuyable.multipliedBy(bigNumberTenPow18)
      // Handle rounding error
      return result.multipliedBy(new BigNumber('0.9999'))
    }

    // We can buy the full remaining hatch
    buyable = remainingHatch.multipliedBy(bigNumberTenPow18)
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
  const result = buyable.plus(
    numerator.div(denominator).multipliedBy(bigNumberTenPow18)
  )
  // Handle rounding error
  return result.multipliedBy(new BigNumber('0.9999'))
}

export function calculateIdeaTokensInputForDaiOutput(
  daiBN: BN,
  supplyBN: BN,
  market: IdeaMarket
): BigNumber {
  const dai = new BigNumber(daiBN.toString()).div(bigNumberTenPow18)
  const supply = new BigNumber(supplyBN.toString()).div(bigNumberTenPow18)

  const hatchTokens = new BigNumber(market.rawHatchTokens.toString()).div(
    bigNumberTenPow18
  )
  const baseCost = new BigNumber(market.rawBaseCost.toString()).div(
    bigNumberTenPow18
  )
  const priceRise = new BigNumber(market.rawPriceRise.toString()).div(
    bigNumberTenPow18
  )
  const totalFee = new BigNumber(
    market.rawTradingFeeRate.add(market.rawPlatformFeeRate).toString()
  )
  const feeScale = new BigNumber('10000')

  if (supplyBN.lte(market.rawHatchTokens)) {
    // We are inside the hatch range
    const result = dai
      .multipliedBy(feeScale)
      .dividedBy(
        baseCost.multipliedBy(feeScale).minus(baseCost.multipliedBy(totalFee))
      )
      .multipliedBy(bigNumberTenPow18)
      .multipliedBy(new BigNumber('1.001'))

    return result
  }

  // We are outside the hatch range
  const distance = supplyBN.sub(market.rawHatchTokens)
  const daiForDistance = calculateIdeaTokenDaiValue(supplyBN, market, distance)
  if (daiForDistance.gte(daiBN)) {
    // We do not need to sell into the hatch range
    const oneDivRFT = new BigNumber('1').dividedBy(
      priceRise.multipliedBy(feeScale.minus(totalFee))
    )
    const ft = feeScale.minus(totalFee)
    const brsh = baseCost.plus(
      priceRise.multipliedBy(supply.minus(hatchTokens))
    )
    const twoDFR = new BigNumber('2')
      .multipliedBy(dai)
      .multipliedBy(feeScale)
      .multipliedBy(priceRise)
    const bf = baseCost.multipliedBy(feeScale)
    const bt = baseCost.multipliedBy(totalFee)
    const fhr = feeScale.multipliedBy(hatchTokens).multipliedBy(priceRise)
    const frs = feeScale.multipliedBy(priceRise).multipliedBy(supply)
    const hrt = hatchTokens.multipliedBy(priceRise).multipliedBy(totalFee)
    const rst = priceRise.multipliedBy(supply).multipliedBy(totalFee)

    const squared = brsh.multipliedBy(brsh)
    const root = ft.multipliedBy(ft.multipliedBy(squared).minus(twoDFR)).sqrt()
    const afterRoot = bf.minus(bt).minus(fhr).plus(frs).plus(hrt).minus(rst)

    return oneDivRFT
      .multipliedBy(afterRoot.minus(root))
      .multipliedBy(bigNumberTenPow18)
      .multipliedBy(new BigNumber('1.001'))
  }

  // We need to sell into the hatch range
  const updatedDaiAmount = dai.minus(new BigNumber(daiForDistance.toString()))

  const result = updatedDaiAmount
    .multipliedBy(feeScale)
    .dividedBy(
      baseCost.multipliedBy(feeScale).minus(baseCost.multipliedBy(totalFee))
    )
    .multipliedBy(bigNumberTenPow18)
    .plus(new BigNumber(distance.toString()))
    .multipliedBy(new BigNumber('1.001'))

  return result
}

export const isServerSide = () => {
  return typeof window === 'undefined'
}
