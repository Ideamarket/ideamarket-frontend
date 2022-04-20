import axios from 'axios'
import create from 'zustand'
import produce from 'immer'
import BN from 'bn.js'
import { request } from 'graphql-request'
import { bigNumberTenPow18, web3BNToFloatString } from 'utils'
import {
  getQueryLockedAmounts,
  getQueryMarket,
  getQueryMarkets,
  getQueryMyTokensMaybeMarket,
  getQuerySingleTokenByID,
  getQueryTokenChartData,
  getQueryTokenLockedChartData,
  getQuerySinglePricePoint,
  getQueryTokenBalances,
  getQueryBalancesOfHolders,
} from './queries'
import { NETWORK, L1_NETWORK, getL1Network } from 'store/networks'
import { getAllListings } from 'actions/web2/getAllListings'
import { getMarketSpecificsByMarketName } from './markets'
import { getSingleListing } from 'actions/web2/getSingleListing'
import { useContractStore } from './contractStore'
import { getOwnedListings } from 'actions/web2/getOwnedListings'
import { getTrades } from 'actions/web2/getTrades'
import getQuerySingleIDTByTokenAddress from './queries/getQuerySingleIDTByTokenAddress'
import Web3 from 'web3'

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
  market: any
  tokenID: number
  listingId: string
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
  isOnChain: boolean
  url: string
  verified: boolean
  upVoted: boolean
  totalVotes: number
  categories: string[]
  averageRating: number
  latestCommentsCount: number
  latestRatingsCount: number
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
  marketNames: string[] = []
): Promise<IdeaMarket[]> {
  try {
    const result = await request(
      HTTP_GRAPHQL_ENDPOINT,
      await getQueryMarkets(marketNames.filter((n) => n !== 'All'))
    )
    return result.ideaMarkets.map((market) =>
      subgraphResponseToIdeaMarket(market)
    )
  } catch (error) {
    console.error('queryMarkets failed')
    return []
  }
}

export async function queryMarket(marketName: string): Promise<IdeaMarket> {
  try {
    const result = await request(
      HTTP_GRAPHQL_ENDPOINT,
      getQueryMarket(marketName)
    )
    return result.ideaMarkets
      .map((market) => subgraphResponseToIdeaMarket(market))
      .pop()
  } catch (error) {
    console.error('queryMarket failed')
    return null
  }
}

const apiResponseToIdeaToken = (apiResponse) => {
  return {
    address: apiResponse.token.address,
    marketName: apiResponse.token.marketName,
    listingId: apiResponse.listingId,
    tokenID: apiResponse.token.tokenID,
    name: apiResponse.token.name,
    supply: apiResponse.token.supply,
    rawSupply: new BN(apiResponse.token.rawSupply, 'hex'),
    holders: apiResponse.token.holders,
    marketCap: apiResponse.token.marketCap,
    rawMarketCap: new BN(apiResponse.token.rawMarketCap, 'hex'),
    tokenOwner: apiResponse.token.tokenOwner,
    daiInToken: apiResponse.token.daiInToken,
    rawDaiInToken: new BN(apiResponse.token.rawDaiInToken, 'hex'),
    invested: apiResponse.token.invested,
    rawInvested: new BN(apiResponse.token.rawInvested, 'hex'),
    dayChange: apiResponse.token.dayChange,
    weeklyChange: apiResponse.token.weeklyChange,
    listedAt: apiResponse.token.listedAt,
    lockedPercentage: apiResponse.token.lockedPercentage,
    isL1: apiResponse.token.isL1,
    holder: apiResponse.token.holder,
  }
}

/**
 * The goal of this is to create 1 IdeaToken format across entire frontend (even if subgraph returns different object formats for different queries)
 * @param apiResponse -- Response from subgraph
 * @returns object in form that should be consistent across entire frontend
 */
function subgraphResponseToIDT(apiResponse): IdeaToken {
  const marketSpecifics = getMarketSpecificsByMarketName(
    apiResponse?.market?.name
  )
  const url =
    apiResponse?.market?.name === 'URL'
      ? apiResponse?.name
      : marketSpecifics?.getTokenURL(apiResponse?.name)

  const ret = {
    address: apiResponse.id,
    market: apiResponse?.market,
    tokenID: apiResponse.tokenID,
    name: apiResponse.name,
    url,
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
  } as IdeaToken

  return ret
}

const apiResponseToIdeaMarket = (apiResponse) => {
  return {
    name: apiResponse.market.name,
    marketID: apiResponse.market.marketID,
    baseCost: apiResponse.market.baseCost,
    rawBaseCost: new BN(apiResponse.market.rawBaseCost, 'hex'),
    priceRise: apiResponse.market.priceRise,
    rawPriceRise: new BN(apiResponse.market.rawPriceRise, 'hex'),
    hatchTokens: apiResponse.market.hatchTokens,
    rawHatchTokens: new BN(apiResponse.market.rawHatchTokens, 'hex'),
    tradingFeeRate: apiResponse.market.tradingFeeRate,
    rawTradingFeeRate: new BN(apiResponse.market.rawTradingFeeRate, 'hex'),
    platformFeeInvested: apiResponse.market.platformFeeInvested,
    rawPlatformFeeInvested: new BN(
      apiResponse.market.rawPlatformFeeInvested,
      'hex'
    ),
    platformFeeRate: apiResponse.market.platformFeeRate,
    rawPlatformFeeRate: new BN(apiResponse.market.rawPlatformFeeRate, 'hex'),
    platformOwner: apiResponse.market.platformOwner,
    nameVerifierAddress: apiResponse.market.nameVerifierAddress,
  }
}

export async function queryOwnedTokensMaybeMarket(
  ownerAddress: string,
  markets: IdeaMarket[],
  limit: number,
  skip = 0,
  orderBy: string,
  orderDirection: string,
  filterTokens: string[],
  nameSearch: string,
  isLockedFilterActive: boolean
): Promise<any> {
  if (ownerAddress === undefined || !ownerAddress || !markets) {
    return []
  }

  const marketIds = markets.map((market) => market.marketID).join()

  const {
    holdings: ownedResponse,
    totalOwnedTokensValue,
    totalLockedTokensValue,
  } = await getOwnedListings({
    ownerAddress,
    marketIds,
    skip,
    limit,
    orderBy,
    orderDirection,
    filterTokens,
    nameSearch,
    isLockedFilterActive,
  })

  return {
    holdings: ownedResponse.map(
      (pair: any) =>
        ({
          token: apiResponseToIdeaToken(pair),
          market: apiResponseToIdeaMarket(pair),
          rawBalance: new BN(pair.rawBalance, 'hex'),
          balance: pair.balance,
          lockedAmount: pair.lockedAmount,
        } as any)
    ),
    totalOwnedTokensValue,
    totalLockedTokensValue,
  }
}

export async function queryMyTokensMaybeMarket(
  market: IdeaMarket,
  owner: string
): Promise<IdeaTokenMarketPair[]> {
  if (owner === undefined) {
    return []
  }

  let result = null
  try {
    result = await request(
      HTTP_GRAPHQL_ENDPOINT,
      getQueryMyTokensMaybeMarket(market ? market.marketID : undefined, owner)
    )
  } catch (error) {
    console.error('getQueryMyTokensMaybeMarket failed')
    return []
  }

  return result.ideaTokens.map(
    (token) =>
      ({
        token: subgraphResponseToIdeaToken(token, token.market, owner),
        market: subgraphResponseToIdeaMarket(token.market),
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
  isVerifiedFilter: boolean,
  marketFilterType: string, // Value will be 'ghost', 'onchain', or 'both'
  jwt: string,
  categories: string[]
]

export async function queryTokens(
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isVerifiedFilter,
    marketFilterType,
    jwt,
    categories,
  ] = params

  const fromTs = Math.floor(Date.now() / 1000) - duration
  const marketIds = markets.map((market) => market.marketID).join()

  const marketType =
    marketFilterType === 'both'
      ? null
      : marketFilterType === 'ghost'
      ? 'ghost'
      : 'onchain'

  const L2Result = await getAllListings({
    marketType,
    marketIds,
    skip,
    limit: num,
    orderBy,
    orderDirection,
    filterTokens,
    earliestPricePointTs: fromTs,
    search,
    isVerifiedFilter,
    jwt,
    categories,
  })

  return await Promise.all(
    L2Result.map(async (token) => {
      return newApiResponseToIdeaToken(token)
    })
  )
}

export async function querySingleToken(
  value: string,
  onchainValue: string,
  marketId: number,
  listingId?: string,
  jwt?: string
): Promise<IdeaToken> {
  const apiResponse = await getSingleListing({
    value,
    onchainValue,
    marketId,
    listingId,
    jwt,
  })
  return apiResponse ? newApiResponseToIdeaToken(apiResponse) : null
}

export async function querySingleIDTByTokenAddress(idtAddress: string) {
  let subgraphResponse = null
  try {
    subgraphResponse = await request(
      HTTP_GRAPHQL_ENDPOINT,
      getQuerySingleIDTByTokenAddress(idtAddress)
    )
  } catch (error) {
    console.error('getQuerySingleIDTByTokenAddress failed', error)
  }

  return subgraphResponse
    ? subgraphResponseToIDT(subgraphResponse?.ideaTokens[0])
    : null
}

export async function querySingleTokenByID(
  queryKey: string,
  marketID: string,
  tokenID: string
): Promise<IdeaToken> {
  if (!marketID || !tokenID) {
    return undefined
  }

  let result = null
  try {
    result = await request(
      HTTP_GRAPHQL_ENDPOINT,
      getQuerySingleTokenByID(marketID, tokenID)
    )
  } catch (error) {
    console.error('getQuerySingleTokenByID failed', error)
  }

  if (result?.ideaMarkets?.[0]?.tokens?.[0]) {
    return subgraphResponseToIdeaToken(result.ideaMarkets[0].tokens[0])
  }

  return null
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
    let result = null
    try {
      result = await request(
        HTTP_GRAPHQL_ENDPOINT,
        getQueryTokenBalances({
          marketName,
          tokenName,
          first: 100,
          skip: page * 100,
        })
      )
    } catch (error) {
      console.error('getQueryTokenBalances failed', error)
    }

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
  holder: string
): Promise<IdeaTokenMarketPair[]> {
  if (!holder) {
    return
  }

  let page = 0

  const res: IdeaTokenMarketPair[] = []
  const allMarketNames: string[] = []

  while (true) {
    let result = null
    try {
      result = await request(
        HTTP_GRAPHQL_ENDPOINT_L1,
        getQueryBalancesOfHolders({
          holders: [holder],
          first: 100,
          skip: page * 100,
        })
      )
    } catch (error) {
      console.error('getQueryBalancesOfHolders failed', error)
    }

    const filtered = result?.ideaTokenBalances.filter((b) => b.amount !== '0')

    for (let raw of filtered) {
      const token = subgraphResponseToIdeaToken(raw.token)
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

  const allMarkets: IdeaMarket[] = await queryMarkets(allMarketNames)

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
    let result = null
    try {
      result = await request(
        HTTP_GRAPHQL_ENDPOINT,
        getQueryBalancesOfHolders({
          holders: holdersOfToken,
          first: 100,
          skip: page * 100,
        })
      )
    } catch (error) {
      console.error('getQueryBalancesOfHolders failed', error)
    }

    const ideaTokenBalancesInThisPage = result?.ideaTokenBalances
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
        token: subgraphResponseToIdeaToken(balance.token, balance.token.market),
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
  tokenAddress: string,
  duration: number,
  latestPricePoint: IdeaTokenPricePoint,
  maxPricePoints: number
): Promise<IdeaTokenPricePoint[]> {
  if (!tokenAddress) {
    return undefined
  }

  const fromTs = Math.floor(Date.now() / 1000) - duration

  let earliestPricePointResult = null
  try {
    earliestPricePointResult = await request(
      HTTP_GRAPHQL_ENDPOINT,
      getQuerySinglePricePoint(tokenAddress, fromTs)
    )
  } catch (error) {
    console.error('getQuerySinglePricePoint failed', error)
  }

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

  let result = null
  try {
    result = await request(
      HTTP_GRAPHQL_ENDPOINT,
      getQueryTokenChartData(tokenAddress.toLowerCase(), getCounters)
    )
  } catch (error) {
    console.error('getQueryTokenChartData failed', error)
  }

  if (!result || !result.ideaTokenPricePoints) {
    return []
  }

  return result.ideaTokenPricePoints.map((p) => apiResponseToPricePoint(p))
}

export async function queryTokenLockedChartData(
  tokenAddres: string,
  duration: number
): Promise<LockedAmount[]> {
  if (!tokenAddres) {
    return undefined
  }

  const toTs = Math.floor(Date.now() / 1000) + duration

  let result = null
  try {
    result = await request(
      HTTP_GRAPHQL_ENDPOINT,
      getQueryTokenLockedChartData(tokenAddres.toLowerCase(), toTs)
    )
  } catch (error) {
    console.error('getQueryTokenLockedChartData failed', error)
  }

  if (!result || !result.lockedIdeaTokenAmounts) {
    return undefined
  }

  return result.lockedIdeaTokenAmounts.map((locked) =>
    apiResponseToLockedAmount(locked)
  )
}

export async function queryLockedAmounts(
  tokenAddress: string,
  ownerAddress: string,
  skip: number,
  num: number,
  orderBy: string,
  orderDirection: string,
  isL1: boolean
): Promise<LockedAmount[]> {
  if (!tokenAddress || !ownerAddress) {
    return []
  }

  let result = null
  try {
    result = await request(
      isL1 ? HTTP_GRAPHQL_ENDPOINT_L1 : HTTP_GRAPHQL_ENDPOINT,
      getQueryLockedAmounts(
        tokenAddress.toLowerCase(),
        ownerAddress.toLowerCase(),
        skip,
        num,
        orderBy,
        orderDirection
      )
    )
  } catch (error) {
    console.error('getQueryLockedAmounts failed', error)
  }

  const ideaTokenVaultL2 = useContractStore.getState().ideaTokenVaultContract

  const l1Network = getL1Network(NETWORK)
  const deployedAddressesL1 = l1Network.getDeployedAddresses()
  const abisL1 = l1Network.getDeployedABIs()
  const web3L1 = new Web3(l1Network.getRPCURL())

  const ideaTokenVaultContractL1 = new web3L1.eth.Contract(
    abisL1.ideaTokenVault as any,
    deployedAddressesL1.ideaTokenVault,
    { from: web3L1.eth.defaultAccount }
  )

  let blockchainLockedEntries = []
  try {
    // Need to get lockedAmounts from blockchain bc subgraph data is not updated after unlocking contract called. This is bc no event is being emitted from contract. Changing contract now would take a lot of time, so can't do now.
    blockchainLockedEntries = isL1
      ? await ideaTokenVaultContractL1.methods
          .getLockedEntries(
            tokenAddress,
            ownerAddress,
            100 // TODO: make bigger # if people start locking more than 100 times at once
          )
          .call()
      : await ideaTokenVaultL2.methods
          .getLockedEntries(
            tokenAddress,
            ownerAddress,
            100 // TODO: make bigger # if people start locking more than 100 times at once
          )
          .call()
  } catch (error) {
    console.error('getLockedEntries blockchain method call failed', error)
  }

  // Helper method since blockchain returns array of arrays for lockedAmounts
  const isLockedUntilOnChain = (lockedUntil: any): boolean => {
    let isOnChain = false
    blockchainLockedEntries.forEach((entry: any) => {
      if (entry?.lockedUntil === lockedUntil) isOnChain = true
    })

    return isOnChain
  }

  // Locked tokens with already-unlocked filtered out of subgraph data (since subgraph data not updated)
  const lockedTokens = result.lockedIdeaTokenAmounts.filter((locked) =>
    isLockedUntilOnChain(locked.lockedUntil)
  )

  if (!result || !result.lockedIdeaTokenAmounts) {
    return []
  }

  return lockedTokens.map((locked) => apiResponseToLockedAmount(locked))
}

export async function queryInterestManagerTotalShares(): Promise<BN> {
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
  ownerAddress: string,
  markets: IdeaMarket[],
  limit: number,
  skip = 0,
  orderBy: string,
  orderDirection: string,
  filterTokens: string[],
  nameSearch: string
): Promise<any> {
  if (ownerAddress === undefined || !ownerAddress) {
    return []
  }

  const marketIds = markets.map((market) => market.marketID).join()

  const { trades: tradesResponse, totalTradesValue } = await getTrades({
    ownerAddress,
    marketIds,
    skip,
    limit,
    orderBy,
    orderDirection,
    filterTokens,
    nameSearch,
  })

  return {
    trades: tradesResponse.map((pair) =>
      apiResponseToIdeaTokenTrade(pair, ownerAddress)
    ),
    totalTradesValue,
  }
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
  if (weeklyPricePoints?.length > 0) {
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

function subgraphResponseToIdeaToken(
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
    listingId: apiResponse?.listingId, // web2 ghost ID
    address: apiResponse.id,
    marketID: market?.id,
    marketName: market?.name,
    tokenID: apiResponse.tokenID,
    name: apiResponse.name,
    supply: apiResponse.supply
      ? web3BNToFloatString(new BN(apiResponse.supply), bigNumberTenPow18, 2)
      : undefined,
    rawSupply: apiResponse.rawSupply
      ? new BN(apiResponse.rawSupply)
      : undefined,
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
    weeklyChange:
      (apiResponse?.pricePoints && getWeeklyChange(apiResponse?.pricePoints)) ||
      '0',
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

export function newApiResponseToIdeaToken(
  apiResponse,
  marketApiResponse?,
  holder?,
  isL1?
): IdeaToken {
  const web3TokenData = apiResponse?.web3TokenData
  const isOnChain = apiResponse?.isOnchain

  const marketSpecifics = getMarketSpecificsByMarketName(
    apiResponse?.marketName
  )

  // When marketType is 'onchain', no web2TokenData is returned
  const url = apiResponse?.value
    ? apiResponse?.value
    : marketSpecifics?.getTokenURL(apiResponse?.onchainValue)

  const onchainValue = apiResponse?.onchainValue
    ? apiResponse?.onchainValue
    : marketSpecifics?.convertUserInputToTokenName(url)

  const ret = {
    address: web3TokenData ? web3TokenData?.id : apiResponse?.onchainId,
    marketID: apiResponse?.marketId,
    marketName: apiResponse?.marketName,
    tokenID: apiResponse?.onchainId, // web3 token ID
    listingId: apiResponse?.listingId, // web2 ghost ID
    url,
    name: onchainValue,
    isOnChain,
    price: apiResponse?.price || 0,
    ghostListedBy: apiResponse?.ghostListedBy,
    ghostListedAt: apiResponse?.ghostListedAt,
    onchainListedBy: apiResponse?.onchainListedBy,
    onchainListedAt: apiResponse?.onchainListedAt,
    totalVotes: apiResponse?.totalVotes || 0,
    upVoted: apiResponse?.upVoted,
    supply: web3TokenData?.supply
      ? web3BNToFloatString(new BN(web3TokenData?.supply), bigNumberTenPow18, 2)
      : undefined,
    rawSupply: web3TokenData?.supply
      ? new BN(web3TokenData?.supply)
      : new BN('0'),
    holders: web3TokenData?.holders || 0,
    marketCap: web3TokenData?.marketCap
      ? web3BNToFloatString(
          new BN(web3TokenData?.marketCap),
          bigNumberTenPow18,
          2
        )
      : '0',
    rawMarketCap: web3TokenData?.marketCap
      ? new BN(web3TokenData?.marketCap)
      : new BN('0'),
    rank: web3TokenData?.rank,
    tokenOwner: web3TokenData?.tokenOwner
      ? web3TokenData?.tokenOwner
      : undefined,
    daiInToken: web3TokenData?.daiInToken
      ? web3BNToFloatString(
          new BN(web3TokenData?.daiInToken),
          bigNumberTenPow18,
          2
        )
      : undefined,
    rawDaiInToken: web3TokenData?.daiInToken
      ? new BN(web3TokenData?.daiInToken)
      : undefined,
    invested: web3TokenData?.invested
      ? web3BNToFloatString(
          new BN(web3TokenData?.invested),
          bigNumberTenPow18,
          2
        )
      : undefined,
    rawInvested: web3TokenData?.invested
      ? new BN(web3TokenData?.invested)
      : undefined,
    tokenInterestRedeemed: web3TokenData?.tokenInterestRedeemed
      ? web3BNToFloatString(
          new BN(web3TokenData?.tokenInterestRedeemed),
          bigNumberTenPow18,
          2
        )
      : undefined,
    rawTokenInterestRedeemed: web3TokenData?.tokenInterestRedeemed
      ? new BN(web3TokenData?.tokenInterestRedeemed)
      : undefined,
    latestPricePoint:
      web3TokenData?.latestPricePoint &&
      apiResponseToPricePoint(web3TokenData?.latestPricePoint),
    earliestPricePoint:
      web3TokenData?.earliestPricePoint &&
      web3TokenData?.earliestPricePoint.length > 0 &&
      apiResponseToPricePoint(web3TokenData?.earliestPricePoint[0]),
    dayChange: apiResponse?.dayChange
      ? parseFloat(apiResponse?.dayChange).toFixed(2)
      : 0,
    weeklyChange: apiResponse?.weekChange
      ? parseFloat(apiResponse?.weekChange).toFixed(2)
      : 0,
    dayVolume: web3TokenData?.dayVolume
      ? parseFloat(web3TokenData?.dayVolume).toFixed(2)
      : undefined,
    listedAt: web3TokenData?.listedAt,
    lockedAmount: web3TokenData?.lockedAmount
      ? web3BNToFloatString(
          new BN(web3TokenData?.lockedAmount),
          bigNumberTenPow18,
          2
        )
      : undefined,
    rawLockedAmount: web3TokenData?.lockedAmount
      ? new BN(web3TokenData?.lockedAmount)
      : undefined,
    lockedPercentage: web3TokenData?.lockedPercentage
      ? parseFloat(web3TokenData?.lockedPercentage).toFixed(2)
      : '',
    isL1,
    holder,
    verified: apiResponse?.verified,
    categories: apiResponse?.categories,
    averageRating: apiResponse?.averageRating,
    latestCommentsCount: apiResponse?.latestCommentsCount,
    latestRatingsCount: apiResponse?.latestRatingsCount,
  } as any

  return ret
}

function subgraphResponseToIdeaMarket(apiResponse): IdeaMarket {
  const ret = {
    name: apiResponse.name,
    marketID: apiResponse.marketID,
    baseCost: apiResponse.baseCost,
    rawBaseCost: apiResponse.baseCost
      ? new BN(apiResponse.baseCost)
      : undefined,
    priceRise: apiResponse.priceRise,
    rawPriceRise: apiResponse.priceRise
      ? new BN(apiResponse.priceRise)
      : undefined,
    hatchTokens: apiResponse.hatchTokens,
    rawHatchTokens: apiResponse.hatchTokens
      ? new BN(apiResponse.hatchTokens)
      : undefined,
    tradingFeeRate: apiResponse.tradingFeeRate,
    rawTradingFeeRate: apiResponse.tradingFeeRate
      ? new BN(apiResponse.tradingFeeRate)
      : undefined,
    platformFeeInvested: apiResponse.platformFeeInvested,
    rawPlatformFeeInvested: apiResponse.platformFeeInvested
      ? new BN(apiResponse.platformFeeInvested)
      : undefined,
    platformFeeRate: apiResponse.platformFeeRate,
    rawPlatformFeeRate: apiResponse.platformFeeRate
      ? new BN(apiResponse.platformFeeRate)
      : undefined,
    platformOwner: apiResponse.platformOwner,
    platformInterestRedeemed: apiResponse.platformInterestRedeemed,
    rawPlatformInterestRedeemed: apiResponse.platformInterestRedeemed
      ? new BN(apiResponse.platformInterestRedeemed)
      : undefined,
    platformFeeRedeemed: apiResponse.platformFeeRedeemed,
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

function apiResponseToIdeaTokenTrade(apiResponse, ownerAddress) {
  return {
    isBuy: apiResponse.isBuy,
    timestamp: Number(apiResponse.timestamp),
    rawIdeaTokenAmount: new BN(apiResponse.rawIdeaTokenAmount, 'hex'),
    ideaTokenAmount: apiResponse.ideaTokenAmount,
    rawDaiAmount: new BN(apiResponse.rawDaiAmount, 'hex'),
    daiAmount: apiResponse.daiAmount,
    token: apiResponseToIdeaToken(apiResponse),
    market: apiResponseToIdeaMarket(apiResponse),
  } as IdeaTokenTrade
}
