import create from 'zustand'
import produce from 'immer'
import BN from 'bn.js'
import BigNumber from 'bignumber.js'
import { request, gql } from 'graphql-request'

import { web3BNToFloatString } from '../utils'

const tenPow2 = new BigNumber('10').pow(new BigNumber('2'))
const tenPow18 = new BigNumber('10').pow(new BigNumber('18'))

const HTTP_GRAPHQL_ENDPOINT =
  'https://api.thegraph.com/subgraphs/name/ideamarket/ideamarket'

export type IdeaMarket = {
  name: string
  marketID: number
  baseCost: string
  rawBaseCost: BN
  priceRise: string
  rawPriceRise: BN
  tradingFeeRate: string
  rawTradingFeeRate: BN
  platformFeeInvested: string
  rawPlatformFeeInvested: BN
  platformFeeRate: string
  rawPlatformFeeRate: BN
  platformFeeWithdrawer: string
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
  dayPricePoints: IdeaTokenPricePoint[]
  dayChange: string
  dayVolume: string
  url: string
  iconURL: string
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

export async function queryMarket(queryKey: string, marketName: string) {
  const result = await request(
    HTTP_GRAPHQL_ENDPOINT,
    getQueryMarket(marketName)
  )

  const market = result.ideaMarkets[0]

  const newMarket: IdeaMarket = {
    name: market.name,
    marketID: market.marketID,
    baseCost: web3BNToFloatString(new BN(market.baseCost), tenPow18, 2),
    rawBaseCost: new BN(market.baseCost),
    priceRise: web3BNToFloatString(new BN(market.priceRise), tenPow18, 4),
    rawPriceRise: new BN(market.priceRise),
    tradingFeeRate: web3BNToFloatString(
      new BN(market.tradingFeeRate),
      tenPow2,
      2
    ),
    rawTradingFeeRate: new BN(market.tradingFeeRate),
    platformFeeInvested: web3BNToFloatString(
      new BN(market.platformFeeInvested),
      tenPow18,
      2
    ),
    rawPlatformFeeInvested: new BN(market.platformFeeInvested),
    platformFeeRate: web3BNToFloatString(
      new BN(market.platformFeeRate),
      tenPow2,
      2
    ),
    rawPlatformFeeRate: new BN(market.platformFeeRate),
    platformFeeWithdrawer: market.platformFeeWithdrawer,
  }

  return newMarket
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
) {
  const tokens = <IdeaToken[]>[]
  if (!market) {
    return tokens
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

  for (let i = 0; i < result.length; i++) {
    const token = result[i]

    const newToken = <IdeaToken>{
      address: token.id,
      marketID: market.marketID,
      tokenID: token.tokenID,
      name: token.name,
      supply: web3BNToFloatString(new BN(token.supply), tenPow18, 2),
      rawSupply: new BN(token.supply),
      holders: token.holders,
      marketCap: web3BNToFloatString(new BN(token.marketCap), tenPow18, 2),
      rawMarketCap: new BN(token.marketCap),
      interestWithdrawer: token.interestWithdrawer,
      daiInToken: web3BNToFloatString(new BN(token.daiInToken), tenPow18, 2),
      rawDaiInToken: new BN(token.daiInToken),
      invested: web3BNToFloatString(new BN(token.invested), tenPow18, 2),
      rawInvested: new BN(token.invested),
      latestPricePoint: token.latestPricePoint,
      dayPricePoints: token.dayPricePoints,
      dayChange: (parseFloat(token.dayChange) * 100).toFixed(2),
      dayVolume: parseFloat(token.dayVolume).toFixed(2),
      url: getTokenURL(market.name, token.name),
      iconURL: getTokenIconURL(market.name, token.name),
    }

    tokens.push(newToken)
  }

  return tokens
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

function getTokenURL(marketName: string, tokenName: string): string {
  if (marketName === 'TestMarket') {
    return `https://${tokenName}`
  } else {
    return ''
  }
}

function getTokenIconURL(marketName: string, tokenName: string): string {
  if (marketName === 'TestMarket') {
    return `https://${tokenName}/favicon.ico`
  } else {
    return ''
  }
}

function getQueryMarket(marketName: string) {
  return gql`{
    ideaMarkets(where:{name:${'"' + marketName + '"'}}) {
      marketID
      name
      baseCost
      priceRise
      tradingFeeRate
      platformFeeRate
      platformFeeWithdrawer
      platformFeeInvested
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
) {
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
        latestPricePoint {
          timestamp
          oldPrice
          price
        }
        dayVolume
        dayChange
        dayPricePoints(orderBy:timestamp) {
          timestamp
          oldPrice
          price
        }
      }
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
) {
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
        latestPricePoint {
          timestamp
          oldPrice
          price
        }
        dayVolume
        dayChange
        dayPricePoints(orderBy:timestamp) {
          timestamp
          oldPrice
          price
        }
      }
  }`
}
