import create from 'zustand'
import produce from 'immer'
import BN from 'bn.js'
import BigNumber from 'bignumber.js'
import { request } from 'graphql-request'
import { web3BNToFloatString, NETWORK } from 'utils'
import {
  getQueryLockedAmounts,
  getQueryMarket,
  getQueryMarkets,
  getQueryMyTokensMaybeMarket,
  getQueryOwnedTokensMaybeMarket,
  getQuerySingleToken,
  getQueryTokenChartData,
  getQueryTokenLockedChartData,
  getQueryTokenNameTextSearch,
  getQueryTokens,
  getQuerySinglePricePoint,
} from './queries'

const tenPow2 = new BigNumber('10').pow(new BigNumber('2'))
const tenPow18 = new BigNumber('10').pow(new BigNumber('18'))

export const HTTP_GRAPHQL_ENDPOINT =
  NETWORK === 'rinkeby'
    ? 'https://subgraph-rinkeby.backend.ideamarket.io/subgraphs/name/Ideamarket/IdeamarketRINKEBY'
    : NETWORK === 'test'
    ? 'https://subgraph-test.backend.ideamarket.io/subgraphs/name/Ideamarket/IdeamarketTEST'
    : 'https://subgraph.backend.ideamarket.io/subgraphs/name/Ideamarket/Ideamarket'

export type IdeaMarket = {
  name: string
  marketID: number
  baseCost: string
  rawBaseCost: BN
  priceRise: string
  rawPriceRise: BN
  hatchTokens: string
  rawHatchTokens: BN
  tradingFeeRate: string
  rawTradingFeeRate: BN
  platformFeeInvested: string
  rawPlatformFeeInvested: BN
  platformFeeRate: string
  rawPlatformFeeRate: BN
  platformOwner: string
  platformInterestRedeemed: string
  rawPlatformInterestRedeemed: BN
  platformFeeRedeemed: string
  rawPlatformFeeRedeemed: BN
  nameVerifierAddress: string
}

export type IdeaTokenPricePoint = {
  timestamp: number
  counter: number
  oldPrice: number
  price: number
}

export type IdeaToken = {
  address: string
  marketID: number
  tokenID: number
  name: string
  supply: string
  rawSupply: BN
  holders: number
  marketCap: string
  rawMarketCap: BN
  rank: number
  tokenOwner: string
  daiInToken: string
  rawDaiInToken: BN
  invested: string
  rawInvested: BN
  tokenInterestRedeemed: string
  rawTokenInterestRedeemed: BN
  latestPricePoint: IdeaTokenPricePoint
  earliestPricePoint: IdeaTokenPricePoint
  dayChange: string
  dayVolume: string
  listedAt: number
  lockedAmount: string
  rawLockedAmount: BN
  lockedPercentage: string
}

export type IdeaTokenMarketPair = {
  token: IdeaToken
  market: IdeaMarket
  rawBalance: BN
  balance: string
}

export type LockedAmount = {
  rawAmount: BN
  amount: string
  lockedUntil: number
}

type State = {
  watching: { [address: string]: boolean }
}

export const useIdeaMarketsStore = create<State>((set) => ({
  watching: {},
}))

function setNestedState(fn) {
  useIdeaMarketsStore.setState(produce(useIdeaMarketsStore.getState(), fn))
}

export async function initIdeaMarketsStore() {
  let storage = JSON.parse(localStorage.getItem('WATCHING_TOKENS'))
  if (!storage) {
    storage = {}
  }

  setNestedState((s: State) => {
    s.watching = storage
  })
}

export async function queryMarkets(queryKey: string): Promise<IdeaMarket[]> {
  const result = await request(HTTP_GRAPHQL_ENDPOINT, getQueryMarkets())
  return result.ideaMarkets.map((market) => apiResponseToIdeaMarket(market))
}

export async function queryMarket(
  queryKey: string,
  marketName: string
): Promise<IdeaMarket> {
  if (!marketName) {
    return undefined
  }

  const result = await request(
    HTTP_GRAPHQL_ENDPOINT,
    getQueryMarket(marketName)
  )

  const market = result.ideaMarkets[0]
  return apiResponseToIdeaMarket(market)
}

export async function queryOwnedTokensMaybeMarket(
  queryKey: string,
  market: IdeaMarket,
  owner: string
): Promise<IdeaTokenMarketPair[]> {
  if (owner == undefined) {
    return []
  }

  const result = await request(
    HTTP_GRAPHQL_ENDPOINT,
    getQueryOwnedTokensMaybeMarket(market ? market.marketID : undefined, owner)
  )

  return result.ideaTokenBalances.map(
    (balance) =>
      ({
        token: apiResponseToIdeaToken(balance.token, balance.market),
        market: apiResponseToIdeaMarket(balance.market),
        rawBalance: balance.amount ? new BN(balance.amount) : undefined,
        balance: balance.amount
          ? web3BNToFloatString(new BN(balance.amount), tenPow18, 2)
          : undefined,
      } as IdeaTokenMarketPair)
  )
}

export async function queryMyTokensMaybeMarket(
  queryKey: string,
  market: IdeaMarket,
  owner: string
): Promise<IdeaTokenMarketPair[]> {
  if (owner === undefined) {
    return []
  }

  const result = await request(
    HTTP_GRAPHQL_ENDPOINT,
    getQueryMyTokensMaybeMarket(market ? market.marketID : undefined, owner)
  )

  return result.ideaTokens.map(
    (token) =>
      ({
        token: apiResponseToIdeaToken(token, token.market),
        market: apiResponseToIdeaMarket(token.market),
      } as IdeaTokenMarketPair)
  )
}

type Params = [
  market: IdeaMarket,
  num: number,
  duration: number,
  orderBy: string,
  orderDirection: string,
  search: string,
  filterTokens: string[]
]

export async function queryTokens(
  queryKey: string,
  params: Params,
  skip = 0
): Promise<IdeaToken[]> {
  if (!params) {
    return []
  }

  const [
    market,
    num,
    duration,
    orderBy,
    orderDirection,
    search,
    filterTokens,
  ] = params

  const fromTs = Math.floor(Date.now() / 1000) - duration

  let result
  if (search.length >= 2) {
    result = (
      await request(
        HTTP_GRAPHQL_ENDPOINT,
        getQueryTokenNameTextSearch(
          market.marketID,
          skip,
          num,
          fromTs,
          orderBy,
          orderDirection,
          search,
          filterTokens
        )
      )
    ).tokenNameSearch
  } else {
    result = (
      await request(
        HTTP_GRAPHQL_ENDPOINT,
        getQueryTokens(
          market.marketID,
          skip,
          num,
          fromTs,
          orderBy,
          orderDirection,
          filterTokens
        )
      )
    ).ideaMarkets[0].tokens
  }

  return result.map((token) => apiResponseToIdeaToken(token, market))
}

export async function querySingleToken(
  queryKey: string,
  marketName: string,
  tokenName: string
): Promise<IdeaToken> {
  if (!marketName || !tokenName) {
    return undefined
  }

  const result = await request(
    HTTP_GRAPHQL_ENDPOINT,
    getQuerySingleToken(marketName, tokenName)
  )

  if (result?.ideaMarkets?.[0]?.tokens?.[0]) {
    return apiResponseToIdeaToken(result.ideaMarkets[0].tokens[0])
  }

  return undefined
}

export async function queryTokenChartData(
  queryKey,
  tokenAddress: string,
  duration: number,
  latestPricePoint: IdeaTokenPricePoint,
  maxPricePoints: number
): Promise<IdeaTokenPricePoint[]> {
  if (!tokenAddress) {
    return undefined
  }

  const fromTs = Math.floor(Date.now() / 1000) - duration

  const earliestPricePointResult = await request(
    HTTP_GRAPHQL_ENDPOINT,
    getQuerySinglePricePoint(tokenAddress, fromTs)
  )

  if (
    !earliestPricePointResult ||
    !earliestPricePointResult.ideaTokenPricePoints ||
    earliestPricePointResult.ideaTokenPricePoints.length === 0
  ) {
    return []
  }

  const earliestPricePoint = apiResponseToPricePoint(
    earliestPricePointResult.ideaTokenPricePoints[0]
  )
  const numPricePoints =
    latestPricePoint.counter - earliestPricePoint.counter + 1

  let getCounters = []
  if (numPricePoints <= maxPricePoints) {
    for (
      let i = earliestPricePoint.counter;
      i <= latestPricePoint.counter;
      i++
    ) {
      getCounters.push(i)
    }
  } else {
    const w = numPricePoints / maxPricePoints

    for (let i = 0; i < maxPricePoints - 1; i++) {
      getCounters.push(earliestPricePoint.counter + Math.floor((i + 1) * w))
    }

    getCounters.push(latestPricePoint.counter)
  }

  const result = await request(
    HTTP_GRAPHQL_ENDPOINT,
    getQueryTokenChartData(tokenAddress.toLowerCase(), getCounters)
  )

  if (!result || !result.ideaTokenPricePoints) {
    return []
  }

  return result.ideaTokenPricePoints.map((p) => apiResponseToPricePoint(p))
}

export async function queryTokenLockedChartData(
  queryKey,
  tokenAddres: string,
  duration: number
): Promise<LockedAmount[]> {
  if (!tokenAddres) {
    return undefined
  }

  const toTs = Math.floor(Date.now() / 1000) + duration

  const result = await request(
    HTTP_GRAPHQL_ENDPOINT,
    getQueryTokenLockedChartData(tokenAddres.toLowerCase(), toTs)
  )

  if (!result || !result.lockedIdeaTokenAmounts) {
    return undefined
  }

  return result.lockedIdeaTokenAmounts.map((locked) =>
    apiResponseToLockedAmount(locked)
  )
}

export async function queryLockedAmounts(
  queryKey,
  tokenAddress: string,
  ownerAddress: string,
  skip: number,
  num: number,
  orderBy: string,
  orderDirection: string
): Promise<LockedAmount[]> {
  if (!tokenAddress || !ownerAddress) {
    return []
  }

  const result = await request(
    HTTP_GRAPHQL_ENDPOINT,
    getQueryLockedAmounts(
      tokenAddress.toLowerCase(),
      ownerAddress.toLowerCase(),
      skip,
      num,
      orderBy,
      orderDirection
    )
  )

  if (!result || !result.lockedIdeaTokenAmounts) {
    return []
  }

  return result.lockedIdeaTokenAmounts.map((locked) =>
    apiResponseToLockedAmount(locked)
  )
}

export function setIsWatching(token: IdeaToken, watching: boolean): void {
  const address = token.address

  setNestedState((s: State) => {
    if (watching) {
      s.watching[address] = true
    } else {
      delete s.watching[address]
    }
  })

  localStorage.setItem(
    'WATCHING_TOKENS',
    JSON.stringify(useIdeaMarketsStore.getState().watching)
  )
}

function apiResponseToIdeaToken(apiResponse, marketApiResponse?): IdeaToken {
  let market
  if (apiResponse.market) {
    market = apiResponse.market
  } else if (marketApiResponse) {
    market = marketApiResponse
  }

  const ret = {
    address: apiResponse.id,
    marketID: market?.id,
    tokenID: apiResponse.tokenID,
    name: apiResponse.name,
    supply: apiResponse.supply
      ? web3BNToFloatString(new BN(apiResponse.supply), tenPow18, 2)
      : undefined,
    rawSupply: apiResponse.supply ? new BN(apiResponse.supply) : undefined,
    holders: apiResponse.holders,
    marketCap: apiResponse.marketCap
      ? web3BNToFloatString(new BN(apiResponse.marketCap), tenPow18, 2)
      : undefined,
    rawMarketCap: apiResponse.marketCap
      ? new BN(apiResponse.marketCap)
      : undefined,
    rank: apiResponse.rank,
    tokenOwner: apiResponse.tokenOwner ? apiResponse.tokenOwner : undefined,
    daiInToken: apiResponse.daiInToken
      ? web3BNToFloatString(new BN(apiResponse.daiInToken), tenPow18, 2)
      : undefined,
    rawDaiInToken: apiResponse.daiInToken
      ? new BN(apiResponse.daiInToken)
      : undefined,
    invested: apiResponse.invested
      ? web3BNToFloatString(new BN(apiResponse.invested), tenPow18, 2)
      : undefined,
    rawInvested: apiResponse.invested
      ? new BN(apiResponse.invested)
      : undefined,
    tokenInterestRedeemed: apiResponse.tokenInterestRedeemed
      ? web3BNToFloatString(
          new BN(apiResponse.tokenInterestRedeemed),
          tenPow18,
          2
        )
      : undefined,
    rawTokenInterestRedeemed: apiResponse.tokenInterestRedeemed
      ? new BN(apiResponse.tokenInterestRedeemed)
      : undefined,
    latestPricePoint:
      apiResponse.latestPricePoint &&
      apiResponseToPricePoint(apiResponse.latestPricePoint),
    earliestPricePoint:
      apiResponse.earliestPricePoint &&
      apiResponse.earliestPricePoint.length > 0 &&
      apiResponseToPricePoint(apiResponse.earliestPricePoint[0]),
    dayChange: apiResponse.dayChange
      ? (parseFloat(apiResponse.dayChange) * 100).toFixed(2)
      : undefined,
    dayVolume: apiResponse.dayVolume
      ? parseFloat(apiResponse.dayVolume).toFixed(2)
      : undefined,
    listedAt: apiResponse.listedAt,
    lockedAmount: apiResponse.lockedAmount
      ? web3BNToFloatString(new BN(apiResponse.lockedAmount), tenPow18, 2)
      : undefined,
    rawLockedAmount: apiResponse.lockedAmount
      ? new BN(apiResponse.lockedAmount)
      : undefined,
    lockedPercentage: apiResponse.lockedPercentage
      ? parseFloat(apiResponse.lockedPercentage).toFixed(2)
      : '',
  } as IdeaToken

  return ret
}

function apiResponseToIdeaMarket(apiResponse): IdeaMarket {
  const ret = {
    name: apiResponse.name,
    marketID: apiResponse.marketID,
    baseCost: apiResponse.baseCost
      ? web3BNToFloatString(new BN(apiResponse.baseCost), tenPow18, 2)
      : undefined,
    rawBaseCost: apiResponse.baseCost
      ? new BN(apiResponse.baseCost)
      : undefined,
    priceRise: apiResponse.priceRise
      ? web3BNToFloatString(new BN(apiResponse.priceRise), tenPow18, 4)
      : undefined,
    rawPriceRise: apiResponse.priceRise
      ? new BN(apiResponse.priceRise)
      : undefined,
    hatchTokens: apiResponse.hatchTokens
      ? web3BNToFloatString(new BN(apiResponse.hatchTokens), tenPow18, 2)
      : undefined,
    rawHatchTokens: apiResponse.hatchTokens
      ? new BN(apiResponse.hatchTokens)
      : undefined,
    tradingFeeRate: apiResponse.tradingFeeRate
      ? web3BNToFloatString(new BN(apiResponse.tradingFeeRate), tenPow2, 2)
      : undefined,
    rawTradingFeeRate: apiResponse.tradingFeeRate
      ? new BN(apiResponse.tradingFeeRate)
      : undefined,
    platformFeeInvested: apiResponse.platformFeeInvested
      ? web3BNToFloatString(
          new BN(apiResponse.platformFeeInvested),
          tenPow18,
          2
        )
      : undefined,
    rawPlatformFeeInvested: apiResponse.platformFeeInvested
      ? new BN(apiResponse.platformFeeInvested)
      : undefined,
    platformFeeRate: apiResponse.platformFeeRate
      ? web3BNToFloatString(new BN(apiResponse.platformFeeRate), tenPow2, 2)
      : undefined,
    rawPlatformFeeRate: apiResponse.platformFeeRate
      ? new BN(apiResponse.platformFeeRate)
      : undefined,
    platformOwner: apiResponse.platformOwner,
    platformInterestRedeemed: apiResponse.platformInterestRedeemed
      ? web3BNToFloatString(
          new BN(apiResponse.platformInterestRedeemed),
          tenPow2,
          2
        )
      : undefined,
    rawPlatformInterestRedeemed: apiResponse.platformInterestRedeemed
      ? new BN(apiResponse.platformInterestRedeemed)
      : undefined,
    platformFeeRedeemed: apiResponse.platformFeeRedeemed
      ? web3BNToFloatString(new BN(apiResponse.platformFeeRedeemed), tenPow2, 2)
      : undefined,
    rawPlatformFeeRedeemed: apiResponse.platformFeeRedeemed
      ? new BN(apiResponse.platformFeeRedeemed)
      : undefined,
    nameVerifierAddress: apiResponse.nameVerifier,
  } as IdeaMarket

  return ret
}

function apiResponseToPricePoint(apiResponse): IdeaTokenPricePoint {
  return {
    timestamp: parseInt(apiResponse.timestamp),
    counter: parseInt(apiResponse.counter),
    oldPrice: parseFloat(apiResponse.oldPrice),
    price: parseFloat(apiResponse.price),
  } as IdeaTokenPricePoint
}

function apiResponseToLockedAmount(apiResponse): LockedAmount {
  const ret = {
    amount: apiResponse.amount
      ? web3BNToFloatString(new BN(apiResponse.amount), tenPow18, 2)
      : undefined,
    rawAmount: apiResponse.amount ? new BN(apiResponse.amount) : undefined,
    lockedUntil: parseInt(apiResponse.lockedUntil),
  } as LockedAmount

  return ret
}
