import { request, gql } from 'graphql-request'
import { web3TenPow18 } from '../utils'
import { NETWORK } from 'store/networks'
import BN from 'bn.js'
import BigNumber from 'bignumber.js'

const DAI_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f'
const CDAI_ADDRESS = NETWORK.getExternalAddresses().cDai

const HTTP_GRAPHQL_ENDPOINT =
  'https://subgraph-compound.backend.ideamarket.io/subgraphs/name/graphprotocol/compound-v2'

export async function querySupplyRate(queryKey: string): Promise<number> {
  const result = await request(
    HTTP_GRAPHQL_ENDPOINT,
    getQuerySupplyRate(DAI_ADDRESS)
  )
  const market = result.markets[0]
  return parseFloat(market.supplyRate)
}

export async function queryExchangeRate(queryKey: string): Promise<BN> {
  const result = await request(
    HTTP_GRAPHQL_ENDPOINT,
    getQueryExchangeRate(DAI_ADDRESS)
  )
  const market = result.markets[0]
  return new BN(
    new BigNumber(market.exchangeRate)
      .multipliedBy(new BigNumber('10').exponentiatedBy(new BigNumber('28')))
      .toFixed(0)
  )
}

export async function queryCDaiBalance(
  queryKey: string,
  address: string
): Promise<BN> {
  const result = await request(
    HTTP_GRAPHQL_ENDPOINT,
    getQueryCDaiBalance(CDAI_ADDRESS, address)
  )

  if (result.accountCTokens[0] === undefined) {
    return new BN('0')
  }

  return new BN(
    new BigNumber(result.accountCTokens[0].cTokenBalance)
      .multipliedBy(new BigNumber('10').exponentiatedBy(new BigNumber('8')))
      .toFixed(0)
  )
}

export function investmentTokenToUnderlying(
  invested: BN,
  exchangeRate: BN
): BN {
  if (!invested || !exchangeRate) {
    return new BN('0')
  }

  return invested.mul(exchangeRate).div(web3TenPow18)
}

function getQuerySupplyRate(asset: string) {
  return gql`{
    markets(where:{underlyingAddress:${'"' + asset.toLowerCase() + '"'}}) {
        supplyRate
    }
  }`
}

function getQueryExchangeRate(asset: string) {
  return gql`{
    markets(where:{underlyingAddress:${'"' + asset.toLowerCase() + '"'}}) {
        exchangeRate
    }
  }`
}

function getQueryCDaiBalance(asset: string, address: string) {
  return gql`{
    accountCTokens(where:{id:"${asset.toLowerCase()}-${address.toLowerCase()}"}) {
      cTokenBalance
    }
  }`
}
