import create from 'zustand'
import Web3 from 'web3'
import IUniswapV3Pool from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import IUniswapV3Factory from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json'
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import ERC20ABI from '../assets/abi-erc20.json'
import { useWalletStore } from './walletStore'
import { getL1Network, NETWORK } from 'store/networks'

type State = {
  factoryContract: any
  quoterContract: any
  exchangeContract: any
  exchangeContractL1: any
  multiActionContract: any
  uniswapFactoryContract: any
  ideaTokenVaultContract: any
  merkleDistributorContract: any
  imoContract: any
  imoStakingContract: any
  sushiStakingContract: any
  drippingIMOSourceContract: any
}

export const useContractStore = create<State>((set) => ({
  factoryContract: undefined,
  quoterContract: undefined,
  exchangeContract: undefined,
  exchangeContractL1: undefined,
  multiActionContract: undefined,
  uniswapFactoryContract: undefined,
  ideaTokenVaultContract: undefined,
  merkleDistributorContract: undefined,
  imoContract: undefined,
  imoStakingContract: undefined,
  sushiStakingContract: undefined,
  drippingIMOSourceContract: undefined,
}))

export function clearContracts() {
  useContractStore.setState({
    factoryContract: undefined,
    quoterContract: undefined,
    exchangeContract: undefined,
    exchangeContractL1: undefined,
    multiActionContract: undefined,
    uniswapFactoryContract: undefined,
    ideaTokenVaultContract: undefined,
    merkleDistributorContract: undefined,
    imoContract: undefined,
    imoStakingContract: undefined,
    sushiStakingContract: undefined,
    drippingIMOSourceContract: undefined,
  })
}

export function initContractsFromWeb3(web3: Web3) {
  const l1Network = getL1Network(NETWORK)
  const deployedAddressesL1 = l1Network.getDeployedAddresses()
  const abisL1 = l1Network.getDeployedABIs()

  const deployedAddresses = NETWORK.getDeployedAddresses()
  const abis = NETWORK.getDeployedABIs()

  const factoryContract = new web3.eth.Contract(
    abis.ideaTokenFactoryAVM as any,
    deployedAddresses.ideaTokenFactoryAVM,
    { from: web3.eth.defaultAccount }
  )

  const exchangeContract = new web3.eth.Contract(
    abis.ideaTokenExchangeAVM as any,
    deployedAddresses.ideaTokenExchangeAVM,
    { from: web3.eth.defaultAccount }
  )

  const exchangeContractL1 = new web3.eth.Contract(
    abisL1.ideaTokenExchange as any,
    deployedAddressesL1.ideaTokenExchange,
    { from: web3.eth.defaultAccount }
  )

  const multiActionContract = new web3.eth.Contract(
    abis.multiAction as any,
    deployedAddresses.multiAction,
    { from: web3.eth.defaultAccount }
  )

  const uniswapFactoryContract = new web3.eth.Contract(
    IUniswapV3Factory.abi as any,
    '0x1F98431c8aD98523631AE4a59f267346ea31F984', // same on all networks
    { from: web3.eth.defaultAccount }
  )

  const quoterContract = new web3.eth.Contract(
    Quoter.abi as any,
    '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6', // same on all networks
    { from: web3.eth.defaultAccount }
  )

  const ideaTokenVaultContract = new web3.eth.Contract(
    abis.ideaTokenVault as any,
    deployedAddresses.ideaTokenVault,
    { from: web3.eth.defaultAccount }
  )

  const merkleDistributorContract = new web3.eth.Contract(
    abis.merkleDistributor as any,
    deployedAddresses.merkleDistributor,
    { from: web3.eth.defaultAccount }
  )

  const imoContract = new web3.eth.Contract(
    abis.imo as any,
    deployedAddresses.imo,
    { from: web3.eth.defaultAccount }
  )

  const imoStakingContract = new web3.eth.Contract(
    abis.imoStaking as any,
    deployedAddresses.imoStaking,
    { from: web3.eth.defaultAccount }
  )

  const sushiStakingContract = new web3.eth.Contract(
    abis.sushiStaking as any,
    deployedAddresses.sushiStaking,
    { from: web3.eth.defaultAccount }
  )

  const drippingIMOSourceContract = new web3.eth.Contract(
    abis.drippingIMOSource as any,
    deployedAddresses.drippingIMOSource,
    { from: web3.eth.defaultAccount }
  )

  useContractStore.setState({
    factoryContract: factoryContract,
    quoterContract: quoterContract,
    exchangeContract: exchangeContract,
    exchangeContractL1: exchangeContractL1,
    multiActionContract: multiActionContract,
    uniswapFactoryContract: uniswapFactoryContract,
    ideaTokenVaultContract: ideaTokenVaultContract,
    merkleDistributorContract: merkleDistributorContract,
    imoContract: imoContract,
    imoStakingContract: imoStakingContract,
    sushiStakingContract: sushiStakingContract,
    drippingIMOSourceContract: drippingIMOSourceContract,
  })
}

export function getERC20Contract(address: string) {
  const web3 = useWalletStore.getState().web3
  return web3
    ? new web3.eth.Contract(ERC20ABI as any, address, {
        from: web3.eth.defaultAccount,
      })
    : null
}

export function getUniswapPoolContract(poolAddress: string) {
  const web3 = useWalletStore.getState().web3
  return web3
    ? new web3.eth.Contract(IUniswapV3Pool.abi as any, poolAddress, {
        from: web3.eth.defaultAccount,
      })
    : null
}
