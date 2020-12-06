import create from 'zustand'
import produce from 'immer'
import BN from 'bn.js'
import BigNumber from 'bignumber.js'
import { request, gql } from 'graphql-request'
import { web3BNToFloatString, NETWORK } from 'utils'
import { getMarketSpecificsByMarketName } from './markets/marketSpecifics'

const tenPow2 = new BigNumber('10').pow(new BigNumber('2'))
const tenPow18 = new BigNumber('10').pow(new BigNumber('18'))

const HTTP_GRAPHQL_ENDPOINT =
  NETWORK === 'rinkeby'
    ? 'https://subgraph-rinkeby.backend.ideamarket.io:8080/subgraphs/name/Ideamarket/IdeamarketRINKEBY'
    : NETWORK === 'test'
    ? 'https://subgraph-test.backend.ideamarket.io:8080/subgraphs/name/Ideamarket/IdeamarketTEST'
    : 'https://api.thegraph.com/subgraphs/name/ideamarket/ideamarket'

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
  platformFeeWithdrawer: string
  nameVerifierAddress: string
}

export type IdeaTokenPricePoint = {
  timestamp: number
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
  interestWithdrawer: string
  daiInToken: string
  rawDaiInToken: BN
  invested: string
  rawInvested: BN
  latestPricePoint: IdeaTokenPricePoint
  weekPricePoints: IdeaTokenPricePoint[]
  pricePoints: IdeaTokenPricePoint[]
  dayChange: string
  dayVolume: string
  listedAt: number
  lockedAmount: string
  rawLockedAmount: BN
}

export type IdeaTokenMarketPair = {
  token: IdeaToken
  market: IdeaMarket
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
  const result = await request(
    HTTP_GRAPHQL_ENDPOINT,
    getQueryOwnedTokensMaybeMarket(market ? market.marketID : undefined, owner)
  )

  return result.ideaTokenBalances.map(
    (balance) =>
      ({
        token: apiResponseToIdeaToken(balance.token, balance.market),
        market: apiResponseToIdeaMarket(balance.market),
      } as IdeaTokenMarketPair)
  )
}

export async function queryTokensInterestReceiverMaybeMarket(
  queryKey: string,
  market: IdeaMarket,
  interestReceiver: string
): Promise<IdeaTokenMarketPair[]> {
  const result = await request(
    HTTP_GRAPHQL_ENDPOINT,
    getQueryTokensInterestReceiverMaybeMarket(
      market ? market.marketID : undefined,
      interestReceiver
    )
  )

  return result.ideaTokens.map(
    (token) =>
      ({
        token: apiResponseToIdeaToken(token, token.market),
        market: apiResponseToIdeaMarket(token.market),
      } as IdeaTokenMarketPair)
  )
}

export async function queryTokens(
  queryKey: string,
  market: IdeaMarket,
  skip: number,
  num: number,
  orderBy: string,
  orderDirection: string,
  search: string,
  filterTokens: string[]
): Promise<IdeaToken[]> {
  if (!market) {
    return []
  }

  let result
  if (search.length >= 2) {
    result = (
      await request(
        HTTP_GRAPHQL_ENDPOINT,
        getQueryTokenNameTextSearch(
          market.marketID,
          skip,
          num,
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
  address: string,
  fromTs: number
): Promise<IdeaToken> {
  if (!address) {
    return undefined
  }

  const result = await request(
    HTTP_GRAPHQL_ENDPOINT,
    getQueryTokenChartData(address.toLowerCase(), fromTs)
  )

  if (!result || !result.ideaToken || !result.ideaToken.pricePoints) {
    return undefined
  }

  return {
    latestPricePoint: result.ideaToken.latestPricePoint,
    pricePoints: result.ideaToken.pricePoints,
  } as IdeaToken
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

function getQueryMarkets(): string {
  return gql`
    {
      ideaMarkets {
        marketID
        name
        baseCost
        priceRise
        hatchTokens
        tradingFeeRate
        platformFeeRate
        platformFeeWithdrawer
        platformFeeInvested
        nameVerifier
      }
    }
  `
}

function getQueryMarket(marketName: string): string {
  return gql`{
    ideaMarkets(where:{name:${'"' + marketName + '"'}}) {
      marketID
      name
      baseCost
      priceRise
      hatchTokens
      tradingFeeRate
      platformFeeRate
      platformFeeWithdrawer
      platformFeeInvested
      nameVerifier
    }
  }`
}

function getQueryTokens(
  marketID: number,
  skip: number,
  num: number,
  orderBy: string,
  orderDirection: string,
  filterTokens: string[]
): string {
  let filterTokensQuery = ''
  if (filterTokens) {
    filterTokensQuery = ',where:{id_in:['
    filterTokens.forEach((value, index) => {
      if (index > 0) {
        filterTokensQuery += ','
      }
      filterTokensQuery += `"${value}"`
    })
    filterTokensQuery += ']}'
  }

  const currentTs = Math.floor(Date.now() / 1000)
  const weekBack = currentTs - 604800

  return gql`
  {
    ideaMarkets(where:{marketID:${marketID.toString()}}) {
      tokens(skip:${skip}, first:${num}, orderBy:${orderBy}, orderDirection:${orderDirection}${filterTokensQuery}) {
        id
        tokenID
        name
        supply
        holders
        marketCap
        interestWithdrawer
        daiInToken
        invested
        listedAt
        lockedAmount
        latestPricePoint {
          timestamp
          oldPrice
          price
        }
        dayVolume
        dayChange
        pricePoints(where:{timestamp_gt:${weekBack}} orderBy:timestamp) {
          timestamp
          oldPrice
          price
        }
      }
    }
  }`
}

function getQueryOwnedTokensMaybeMarket(
  marketID: number,
  owner: string
): string {
  let where

  if (marketID) {
    const hexMarketID = marketID ? '0x' + marketID.toString(16) : ''
    where = `where:{holder:"${owner.toLowerCase()}", amount_gt:0, market:"${hexMarketID}"}`
  } else {
    where = `where:{holder:"${owner.toLowerCase()}", amount_gt:0}`
  }

  return gql`
  {
    ideaTokenBalances(${where}) {
      amount
      token {
        id
        tokenID
        name
        supply
        holders
        marketCap
        interestWithdrawer
        daiInToken
        invested
        listedAt
        dayChange
      }
      market {
        marketID
        name
        baseCost
        priceRise
        hatchTokens
        tradingFeeRate
        platformFeeRate
        platformFeeWithdrawer
        platformFeeInvested
        nameVerifier
      }
    }
  }`
}

function getQueryTokensInterestReceiverMaybeMarket(
  marketID: number,
  interestReceiver: string
): string {
  let where

  if (marketID) {
    const hexMarketID = marketID ? '0x' + marketID.toString(16) : ''
    where = `where:{interestWithdrawer:"${interestReceiver.toLowerCase()}", market:"${hexMarketID}"}`
  } else {
    where = `where:{interestWithdrawer:"${interestReceiver.toLowerCase()}"}`
  }

  return gql`
  {
    ideaTokens(${where}) {
        id
        tokenID
        market {
          marketID
          name
          baseCost
          priceRise
          hatchTokens
          tradingFeeRate
          platformFeeRate
          platformFeeWithdrawer
          platformFeeInvested
          nameVerifier
        }
        name
        supply
        holders
        marketCap
        interestWithdrawer
        daiInToken
        invested
        listedAt
        dayChange
      }
  }`
}

function getQueryTokenNameTextSearch(
  marketID: number,
  skip: number,
  num: number,
  orderBy: string,
  orderDirection: string,
  search: string,
  filterTokens: string[]
): string {
  const hexMarketID = '0x' + marketID.toString(16)

  let filterTokensQuery = ''
  if (filterTokens) {
    filterTokensQuery = ',id_in:['
    filterTokens.forEach((value, index) => {
      if (index > 0) {
        filterTokensQuery += ','
      }
      filterTokensQuery += `"${value}"`
    })
    filterTokensQuery += ']'
  }

  const currentTs = Math.floor(Date.now() / 1000)
  const weekBack = currentTs - 604800

  return gql`
  {
    tokenNameSearch(skip:${skip}, first:${num}, orderBy:${orderBy}, orderDirection:${orderDirection}, where:{market:${
    '"' + hexMarketID + '"'
  }${filterTokensQuery}}, text:${'"' + search + ':*"'}) {
        id
        tokenID
        name
        supply
        holders
        marketCap
        interestWithdrawer
        daiInToken
        invested
        listedAt
        latestPricePoint {
          timestamp
          oldPrice
          price
        }
        dayVolume
        dayChange
        pricePoints(where:{timestamp_gt:${weekBack}} orderBy:timestamp) {
          timestamp
          oldPrice
          price
        }
      }
  }`
}

function getQuerySingleToken(marketName: string, tokenName: string): string {
  return gql`
  {
    ideaMarkets(where:{name:${'"' + marketName + '"'}}) {
      tokens(where:{name:${'"' + tokenName + '"'}}) {
          id
          tokenID
          name
          supply
          holders
          marketCap
          interestWithdrawer
          daiInToken
          invested
          listedAt
          latestPricePoint {
            timestamp
            oldPrice
            price
          }
          dayVolume
          dayChange
      }
    }
  }`
}

function getQueryTokenChartData(address: string, fromTs: number): string {
  return gql`
  {
    ideaToken(id:${'"' + address + '"'}) {
      latestPricePoint {
        timestamp
        oldPrice
        price
      }
      pricePoints(where:{timestamp_gt:${fromTs}} orderBy:timestamp) {
          timestamp
          oldPrice
          price
      }    
    }
  }`
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
    interestWithdrawer: apiResponse.interestWithdrawer
      ? apiResponse.interestWithdrawer
      : undefined,
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
    latestPricePoint: apiResponse.latestPricePoint,
    weekPricePoints: apiResponse.pricePoints,
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
    platformFeeWithdrawer: apiResponse.platformFeeWithdrawer,
    nameVerifierAddress: apiResponse.nameVerifier,
  } as IdeaMarket

  return ret
}
