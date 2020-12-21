import { request, gql } from 'graphql-request'
import { web3TenPow18 } from '../utils'
import BN from 'bn.js'
import BigNumber from 'bignumber.js'

const DAI_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f'
const HTTP_GRAPHQL_ENDPOINT =
  'https://subgraph.backend.ideamarket.io:8080/subgraphs/name/graphprotocol/compound-v2'

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

export function investmentTokenToUnderlying(
  invested: BN,
  exchangeRate: BN
): BN {
  return invested.mul(exchangeRate).div(web3TenPow18)
}

function getQuerySupplyRate(address: string) {
  return gql`{
    markets(where:{underlyingAddress:${'"' + address + '"'}}) {
        supplyRate
    }
  }`
}

function getQueryExchangeRate(address: string) {
  return gql`{
    markets(where:{underlyingAddress:${'"' + address + '"'}}) {
        exchangeRate
    }
  }`
}
