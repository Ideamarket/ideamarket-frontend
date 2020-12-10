import BN from 'bn.js'
import BigNumber from 'bignumber.js'
import Web3 from 'web3'
import { useState, useEffect } from 'react'
import numeral from 'numeral'

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

export function formatNumber(number: string | number): string {
  return numeral(Number(number)).format('0.[00]a')
}
