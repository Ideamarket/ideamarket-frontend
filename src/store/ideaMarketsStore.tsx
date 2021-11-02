import axios from 'axios'
import create from 'zustand'
import produce from 'immer'
import BN from 'bn.js'
import BigNumber from 'bignumber.js'
import { request } from 'graphql-request'
import { bigNumberTenPow18, web3BNToFloatString } from 'utils'
import {
  getQueryLockedAmounts,
  getQueryLockedTokens,
  getQueryMarket,
  getQueryMarkets,
  getQueryMyTokensMaybeMarket,
  getQueryOwnedTokensMaybeMarket,
  getQuerySingleToken,
  getQuerySingleTokenByID,
  getQueryTokenChartData,
  getQueryTokenLockedChartData,
  getQueryTokenNameTextSearch,
  getQueryTokens,
  getQuerySinglePricePoint,
  getQueryTokenBalances,
  getQueryBalancesOfHolders,
  getQueryMyTrades,
} from './queries'
import { NETWORK, L1_NETWORK } from 'store/networks'

const tenPow2 = new BigNumber('10').pow(new BigNumber('2'))

const HTTP_GRAPHQL_ENDPOINT_L1 = L1_NETWORK.getSubgraphURL()
const HTTP_GRAPHQL_ENDPOINT = NETWORK.getSubgraphURL()

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
  marketName: string
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
  weeklyChange: any
  dayVolume: string
  listedAt: number
  lockedAmount: string
  rawLockedAmount: BN
  lockedPercentage: string
  isL1: boolean
  holder: string
}

export type IdeaTokenMarketPair = {
  token: IdeaToken
  market: IdeaMarket
  rawBalance: BN
  balance: string
}

export type LockedIdeaTokenMarketPair = {
  token: IdeaToken
  market: IdeaMarket
  rawBalance: BN
  balance: string
  lockedUntil: number
}

export type LockedAmount = {
  rawAmount: BN
  amount: string
  lockedUntil: number
}

export type IdeaTokenTrade = {
  token: IdeaToken
  isBuy: boolean
  timestamp: number
  rawIdeaTokenAmount: BN
  ideaTokenAmount: number
  rawDaiAmount: BN
  daiAmount: number
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

export async function queryMarkets(
  queryKey: string,
  marketNames: string[] = []
): Promise<IdeaMarket[]> {
  const result = await request(
    HTTP_GRAPHQL_ENDPOINT,
    getQueryMarkets(marketNames.filter((n) => n !== 'All'))
  )
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
  return result.ideaMarkets
    .map((market) => apiResponseToIdeaMarket(market))
    .pop()
}

export async function queryOwnedTokensMaybeMarket(
  queryKey: string,
  market: IdeaMarket,
  owner: string
): Promise<IdeaTokenMarketPair[]> {
  if (owner === undefined) {
    return []
  }

  const L1Result = await request(
    HTTP_GRAPHQL_ENDPOINT_L1,
    getQueryOwnedTokensMaybeMarket(market ? market.marketID : undefined, owner)
  )

  const L2Result = await request(
    HTTP_GRAPHQL_ENDPOINT,
    getQueryOwnedTokensMaybeMarket(market ? market.marketID : undefined, owner)
  )

  const L1IdeaTokenMarketPairs = L1Result.ideaTokenBalances.map(
    (balance) =>
      ({
        token: apiResponseToIdeaToken(
          balance.token,
          balance.market,
          owner,
          true
        ),
        market: apiResponseToIdeaMarket(balance.market),
        rawBalance: balance.amount ? new BN(balance.amount) : undefined,
        balance: balance.amount
          ? web3BNToFloatString(new BN(balance.amount), bigNumberTenPow18, 2)
          : undefined,
      } as IdeaTokenMarketPair)
  )

  const L2IdeaTokenMarketPairs = L2Result.ideaTokenBalances.map(
    (balance) =>
      ({
        token: apiResponseToIdeaToken(
          balance.token,
          balance.market,
          owner,
          false
        ),
        market: apiResponseToIdeaMarket(balance.market),
        rawBalance: balance.amount ? new BN(balance.amount) : undefined,
        balance: balance.amount
          ? web3BNToFloatString(new BN(balance.amount), bigNumberTenPow18, 2)
          : undefined,
      } as IdeaTokenMarketPair)
  )

  return L1IdeaTokenMarketPairs.concat(L2IdeaTokenMarketPairs)
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
        token: apiResponseToIdeaToken(token, token.market, owner),
        market: apiResponseToIdeaMarket(token.market),
      } as IdeaTokenMarketPair)
  )
}

type Params = [
  markets: IdeaMarket[],
  num: number,
  duration: number,
  orderBy: string,
  orderDirection: string,
  search: string,
  filterTokens: string[],
  isVerifiedFilter: boolean
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
    markets,
    num,
    duration,
    orderBy,
    orderDirection,
    search,
    filterTokens,
    isVerifiedFilter,
  ] = params

  const fromTs = Math.floor(Date.now() / 1000) - duration
  const marketIds = markets.map((market) => market.marketID)

  let L2Result
  if (search.length >= 2) {
    L2Result = (
      await request(
        HTTP_GRAPHQL_ENDPOINT,
        getQueryTokenNameTextSearch(
          marketIds,
          skip,
          num,
          fromTs,
          orderBy,
          orderDirection,
          search,
          filterTokens,
          isVerifiedFilter
        )
      )
    ).tokenNameSearch
  } else {
    L2Result = (
      await request(
        HTTP_GRAPHQL_ENDPOINT,
        getQueryTokens(
          marketIds,
          skip,
          num,
          fromTs,
          orderBy,
          orderDirection,
          filterTokens,
          isVerifiedFilter
        )
      )
    ).ideaTokens
  }

  const finalResult = await Promise.all(
    L2Result.map(async (token) => {
      const l1Token = await querySingleToken(
        'token',
        token?.market?.name,
        token?.name,
        true
      )
      let l1LockedAmount = '0'
      if (l1Token) {
        l1LockedAmount = l1Token.lockedAmount
      }
      const l2LockedAmount = web3BNToFloatString(
        new BN(token.lockedAmount),
        bigNumberTenPow18,
        2
      )
      const supply = web3BNToFloatString(
        new BN(token.supply),
        bigNumberTenPow18,
        2
      )
      const lockedPercentage = (
        ((+l1LockedAmount + +l2LockedAmount) / +supply) *
        100
      ).toString()

      return { ...token, lockedPercentage }
    })
  )

  return finalResult.map((token) => apiResponseToIdeaToken(token))
}

export async function querySingleToken(
  queryKey: string,
  marketName: string,
  tokenName: string,
  queryL1: boolean = false
): Promise<IdeaToken> {
  if (!marketName || !tokenName) {
    return undefined
  }

  const result = await request(
    queryL1 ? HTTP_GRAPHQL_ENDPOINT_L1 : HTTP_GRAPHQL_ENDPOINT,
    getQuerySingleToken(marketName, tokenName)
  )

  if (result?.ideaMarkets?.[0]?.tokens?.[0]) {
    return apiResponseToIdeaToken(result.ideaMarkets[0].tokens[0])
  }

  return undefined
}

export async function querySingleTokenByID(
  queryKey: string,
  marketID: string,
  tokenID: string
): Promise<IdeaToken> {
  if (!marketID || !tokenID) {
    return undefined
  }

  const result = await request(
    HTTP_GRAPHQL_ENDPOINT,
    getQuerySingleTokenByID(marketID, tokenID)
  )

  if (result?.ideaMarkets?.[0]?.tokens?.[0]) {
    return apiResponseToIdeaToken(result.ideaMarkets[0].tokens[0])
  }

  return undefined
}

export async function getHoldersOfAToken({
  marketName,
  tokenName,
}: {
  marketName: string
  tokenName: string
}) {
  if (!marketName || !tokenName) {
    return null
  }

  let page = 0

  type Balance = {
    id: string
    amount: string
    holder: string
    token: {
      name: string
    }
  }
  const balances: Balance[] = []

  while (true) {
    const result = await request(
      HTTP_GRAPHQL_ENDPOINT,
      getQueryTokenBalances({
        marketName,
        tokenName,
        first: 100,
        skip: page * 100,
      })
    )

    const balancesInThisPage: Balance[] =
      result?.ideaMarkets?.[0]?.tokens?.[0].balances ?? []
    balances.push(...balancesInThisPage)
    if (balancesInThisPage.length < 100) {
      break
    }
    page += 1
  }

  return balances.map((balance) => balance.holder)
}

export async function queryTokensHeld(
  queryKey: string,
  holder: string
): Promise<IdeaTokenMarketPair[]> {
  if (!holder) {
    return
  }

  let page = 0

  const res: IdeaTokenMarketPair[] = []
  const allMarketNames: string[] = []

  while (true) {
    const result = await request(
      HTTP_GRAPHQL_ENDPOINT_L1,
      getQueryBalancesOfHolders({
        holders: [holder],
        first: 100,
        skip: page * 100,
      })
    )

    const filtered = result.ideaTokenBalances.filter((b) => b.amount !== '0')

    for (let raw of filtered) {
      const token = apiResponseToIdeaToken(raw.token)
      res.push({
        token: token,
        balance: web3BNToFloatString(new BN(raw.amount), bigNumberTenPow18, 2),
        rawBalance: new BN(raw.amount),
        market: null,
      })

      if (!allMarketNames.includes(token.marketName)) {
        allMarketNames.push(token.marketName)
      }
    }

    if (result.ideaTokenBalances.length < 100) {
      break
    }
    page += 1
  }

  const allMarkets: IdeaMarket[] = await queryMarkets('', allMarketNames)

  for (let i = 0; i < res.length; i++) {
    const pair = res[i]
    const marketName = pair.token.marketName
    let market = null

    for (let m of allMarkets) {
      if (m.name === marketName) {
        market = m
        break
      }
    }

    if (market === null) {
      throw Error(`queryTokensHeld: market not found: ${marketName}`)
    }

    res[i].market = market
  }

  return res
}

export type MutualHoldersData = {
  stats: {
    latestTimestamp: number
    totalAmount: number
    totalHolders: number
  }
  token: IdeaToken
}

export async function queryMutualHoldersOfToken({
  marketName,
  tokenName,
}: {
  marketName: string
  tokenName: string
}) {
  if (!marketName || !tokenName) {
    return null
  }
  const holdersOfToken = await getHoldersOfAToken({ marketName, tokenName })

  const allIdeatokenBalances = []
  let page = 0

  while (true) {
    const result = await request(
      HTTP_GRAPHQL_ENDPOINT,
      getQueryBalancesOfHolders({
        holders: holdersOfToken,
        first: 100,
        skip: page * 100,
      })
    )

    const ideaTokenBalancesInThisPage = result.ideaTokenBalances
    allIdeatokenBalances.push(...ideaTokenBalancesInThisPage)
    if (ideaTokenBalancesInThisPage.length < 100) {
      break
    }
    page += 1
  }

  type Balance = {
    id: string
    amount: string
    token: IdeaToken
  }

  const balances: Balance[] = allIdeatokenBalances
    .filter((balance) => Number(balance.amount) > 0)
    .filter((balance) => balance.token.market.name === marketName)
    .filter((balance) => balance.token.name !== tokenName)
    .map((balance) => {
      return {
        ...balance,
        token: apiResponseToIdeaToken(balance.token, balance.token.market),
      }
    })

  const allTokenNames: string[] = balances.map((balance) => balance.token.name)

  const allTokenNamesWithoutDuplicates = allTokenNames.filter(
    (token, index) => allTokenNames.indexOf(token) === index
  )

  const mutualHoldersData: MutualHoldersData[] =
    allTokenNamesWithoutDuplicates.map((tokenName) => {
      const allBalancesWithCurrentToken = balances.filter(
        (_balance) => _balance.token.name === tokenName
      )
      return {
        stats: {
          latestTimestamp: allBalancesWithCurrentToken
            .map((_balance) => _balance.token.latestPricePoint.timestamp)
            .reduce((a, b) => (a < b ? b : a), 0),
          totalAmount: Number(
            allBalancesWithCurrentToken
              .map((balance) => Number(balance.amount) / 1e18)
              .reduce((a, b) => a + b, 0)
              .toFixed(2)
          ),
          totalHolders: allBalancesWithCurrentToken.length,
        },
        token: allBalancesWithCurrentToken[0].token,
      }
    })
  return mutualHoldersData
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

export async function queryLockedTokens(
  queryKey,
  market: IdeaMarket,
  ownerAddress: string
): Promise<LockedIdeaTokenMarketPair[]> {
  if (!ownerAddress) {
    return []
  }

  const marketID = market ? market.marketID : undefined
  let page = 0

  type LockedIdeaTokenAmount = {
    amount: string
    lockedUntil: number
    token
  }
  const L1TokenAmounts: LockedIdeaTokenAmount[] = []
  const L2TokenAmounts: LockedIdeaTokenAmount[] = []

  // API can return max of 100 entries. That means we need to query the API multiple times to retrieve all entries
  while (true) {
    const result = await request(
      HTTP_GRAPHQL_ENDPOINT_L1,
      getQueryLockedTokens({
        ownerAddress,
        first: 100,
        skip: page * 100,
      })
    )

    const tokensInThisPage = result?.lockedIdeaTokenAmounts ?? []

    L1TokenAmounts.push(...tokensInThisPage)
    if (tokensInThisPage.length < 100) {
      break
    }
    page += 1
  }
  page = 0
  while (true) {
    const result = await request(
      HTTP_GRAPHQL_ENDPOINT,
      getQueryLockedTokens({
        ownerAddress,
        first: 100,
        skip: page * 100,
      })
    )

    const tokensInThisPage = result?.lockedIdeaTokenAmounts ?? []

    L2TokenAmounts.push(...tokensInThisPage)
    if (tokensInThisPage.length < 100) {
      break
    }
    page += 1
  }

  // Filter by market if user chooses market option in the select box
  if (marketID) {
    const L1Pairs = L1TokenAmounts.filter(
      (locked) => locked?.token?.market?.marketID === marketID
    ).map((locked) =>
      apiResponseToLockedIdeaTokenMarketPair(locked, ownerAddress, true)
    )
    const L2Pairs = L2TokenAmounts.filter(
      (locked) => locked?.token?.market?.marketID === marketID
    ).map((locked) =>
      apiResponseToLockedIdeaTokenMarketPair(locked, ownerAddress, false)
    )

    return L1Pairs.concat(L2Pairs)
  }

  const L1Pairs = L1TokenAmounts.map((locked) =>
    apiResponseToLockedIdeaTokenMarketPair(locked, ownerAddress, true)
  )
  const L2Pairs = L2TokenAmounts.map((locked) =>
    apiResponseToLockedIdeaTokenMarketPair(locked, ownerAddress, false)
  )

  return L1Pairs.concat(L2Pairs)
}

export async function queryInterestManagerTotalShares(queryKey): Promise<BN> {
  try {
    const response = await axios.get(
      `https://onchain-values.backend.ideamarket.io/interestManagerTotalShares/${NETWORK.getNetworkName()}`
    )
    return new BN(response.data.value)
  } catch (ex) {
    throw Error('Failed to query interestManager total shares')
  }
}

export async function queryMyTrades(
  queryKey,
  market: IdeaMarket,
  ownerAddress: string
): Promise<IdeaTokenTrade[]> {
  if (!ownerAddress) {
    return []
  }

  const marketID = market ? market.marketID : undefined

  let page = 0
  const myTrades: any = []

  // API can return max of 100 entries. That means we need to query the API multiple times to retrieve all entries
  while (true) {
    const result = await request(
      HTTP_GRAPHQL_ENDPOINT,
      getQueryMyTrades({
        ownerAddress,
        first: 100,
        skip: page * 100,
      })
    )

    const tokensInThisPage = result.ideaTokenTrades ?? []

    myTrades.push(...tokensInThisPage)
    if (tokensInThisPage.length < 100) {
      break
    }
    page += 1
  }

  const mapTradeResponse = (trade) =>
    apiResponseToIdeaTokenTrade(trade, ownerAddress)

  // Filter by market if user chooses market option in the select box
  if (marketID) {
    return myTrades
      .filter((trade) => trade?.token?.market?.marketID === marketID)
      .map(mapTradeResponse)
  }

  return myTrades.map(mapTradeResponse)
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

function getWeeklyChange(weeklyPricePoints) {
  let weeklyChange = '0'
  if (weeklyPricePoints.length > 0) {
    const yearlyCurrentPrice = Number(
      weeklyPricePoints[weeklyPricePoints.length - 1].price
    )

    const yearlyOldPrice = Number(weeklyPricePoints[0].oldPrice)
    weeklyChange = Number(
      ((yearlyCurrentPrice - yearlyOldPrice) * 100) / yearlyOldPrice
    ).toFixed(2)
  }
  return weeklyChange
}

function apiResponseToIdeaToken(
  apiResponse,
  marketApiResponse?,
  holder?,
  isL1?
): IdeaToken {
  let market
  if (apiResponse.market) {
    market = apiResponse.market
  } else if (marketApiResponse) {
    market = marketApiResponse
  }

  const ret = {
    address: apiResponse.id,
    marketID: market?.id,
    marketName: market?.name,
    tokenID: apiResponse.tokenID,
    name: apiResponse.name,
    supply: apiResponse.supply
      ? web3BNToFloatString(new BN(apiResponse.supply), bigNumberTenPow18, 2)
      : undefined,
    rawSupply: apiResponse.supply ? new BN(apiResponse.supply) : undefined,
    holders: apiResponse.holders,
    marketCap: apiResponse.marketCap
      ? web3BNToFloatString(new BN(apiResponse.marketCap), bigNumberTenPow18, 2)
      : undefined,
    rawMarketCap: apiResponse.marketCap
      ? new BN(apiResponse.marketCap)
      : undefined,
    rank: apiResponse.rank,
    tokenOwner: apiResponse.tokenOwner ? apiResponse.tokenOwner : undefined,
    daiInToken: apiResponse.daiInToken
      ? web3BNToFloatString(
          new BN(apiResponse.daiInToken),
          bigNumberTenPow18,
          2
        )
      : undefined,
    rawDaiInToken: apiResponse.daiInToken
      ? new BN(apiResponse.daiInToken)
      : undefined,
    invested: apiResponse.invested
      ? web3BNToFloatString(new BN(apiResponse.invested), bigNumberTenPow18, 2)
      : undefined,
    rawInvested: apiResponse.invested
      ? new BN(apiResponse.invested)
      : undefined,
    tokenInterestRedeemed: apiResponse.tokenInterestRedeemed
      ? web3BNToFloatString(
          new BN(apiResponse.tokenInterestRedeemed),
          bigNumberTenPow18,
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
    weeklyChange: getWeeklyChange(apiResponse?.pricePoints) || '0.00',
    dayVolume: apiResponse.dayVolume
      ? parseFloat(apiResponse.dayVolume).toFixed(2)
      : undefined,
    listedAt: apiResponse.listedAt,
    lockedAmount: apiResponse.lockedAmount
      ? web3BNToFloatString(
          new BN(apiResponse.lockedAmount),
          bigNumberTenPow18,
          2
        )
      : undefined,
    rawLockedAmount: apiResponse.lockedAmount
      ? new BN(apiResponse.lockedAmount)
      : undefined,
    lockedPercentage: apiResponse.lockedPercentage
      ? parseFloat(apiResponse.lockedPercentage).toFixed(2)
      : '',
    isL1,
    holder,
  } as IdeaToken

  return ret
}

function apiResponseToIdeaMarket(apiResponse): IdeaMarket {
  const ret = {
    name: apiResponse.name,
    marketID: apiResponse.marketID,
    baseCost: apiResponse.baseCost
      ? web3BNToFloatString(new BN(apiResponse.baseCost), bigNumberTenPow18, 2)
      : undefined,
    rawBaseCost: apiResponse.baseCost
      ? new BN(apiResponse.baseCost)
      : undefined,
    priceRise: apiResponse.priceRise
      ? web3BNToFloatString(new BN(apiResponse.priceRise), bigNumberTenPow18, 4)
      : undefined,
    rawPriceRise: apiResponse.priceRise
      ? new BN(apiResponse.priceRise)
      : undefined,
    hatchTokens: apiResponse.hatchTokens
      ? web3BNToFloatString(
          new BN(apiResponse.hatchTokens),
          bigNumberTenPow18,
          2
        )
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
          bigNumberTenPow18,
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
      ? web3BNToFloatString(new BN(apiResponse.amount), bigNumberTenPow18, 2)
      : undefined,
    rawAmount: apiResponse.amount ? new BN(apiResponse.amount) : undefined,
    lockedUntil: parseInt(apiResponse.lockedUntil),
  } as LockedAmount

  return ret
}

function apiResponseToLockedIdeaTokenMarketPair(
  apiResponse,
  holder,
  isL1
): LockedIdeaTokenMarketPair {
  const ret = {
    token: apiResponseToIdeaToken(
      apiResponse.token,
      apiResponse.token.market,
      holder,
      isL1
    ),
    market: apiResponseToIdeaMarket(apiResponse.token.market),
    rawBalance: apiResponse.amount ? new BN(apiResponse.amount) : undefined,
    balance: apiResponse.amount
      ? web3BNToFloatString(new BN(apiResponse.amount), bigNumberTenPow18, 2)
      : undefined,
    lockedUntil: apiResponse.lockedUntil,
  } as LockedIdeaTokenMarketPair

  return ret
}

function apiResponseToIdeaTokenTrade(apiResponse, ownerAddress) {
  return {
    isBuy: apiResponse.isBuy,
    timestamp: Number(apiResponse.timestamp),
    rawIdeaTokenAmount: new BN(apiResponse.ideaTokenAmount),
    ideaTokenAmount: Number(
      web3BNToFloatString(
        new BN(apiResponse.ideaTokenAmount),
        bigNumberTenPow18,
        2
      )
    ),
    rawDaiAmount: new BN(apiResponse.daiAmount),
    daiAmount: Number(
      web3BNToFloatString(new BN(apiResponse.daiAmount), bigNumberTenPow18, 2)
    ),
    token: {
      ...apiResponse.token,
      ...apiResponseToIdeaToken(
        apiResponse.token,
        apiResponse.token.market,
        ownerAddress
      ),
    },
    market: apiResponseToIdeaMarket(apiResponse.token.market),
  } as IdeaTokenTrade
}
