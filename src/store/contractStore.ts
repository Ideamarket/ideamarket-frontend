import create from 'zustand'
import Web3 from 'web3'
import UniswapFactoryABI from '../assets/abi-uniswap-factory.json'
import UniswapPairABI from '../assets/abi-uniswap-pair.json'
import ERC20ABI from '../assets/abi-erc20.json'
import { useWalletStore } from './walletStore'
import { getL1Network, NETWORK } from 'store/networks'

type State = {
  factoryContract: any
  exchangeContract: any
  exchangeContractL1: any
  multiActionContract: any
  uniswapFactoryContract: any
  ideaTokenVaultContract: any
  merkleDistributorContract: any
  imoContract: any
  imoStakingContract: any
  drippingIMOSourceContract: any
}

export const useContractStore = create<State>((set) => ({
  factoryContract: undefined,
  exchangeContract: undefined,
  exchangeContractL1: undefined,
  multiActionContract: undefined,
  uniswapFactoryContract: undefined,
  ideaTokenVaultContract: undefined,
  merkleDistributorContract: undefined,
  imoContract: undefined,
  imoStakingContract: undefined,
  drippingIMOSourceContract: undefined,
}))

export function clearContracts() {
  useContractStore.setState({
    factoryContract: undefined,
    exchangeContract: undefined,
    exchangeContractL1: undefined,
    multiActionContract: undefined,
    uniswapFactoryContract: undefined,
    ideaTokenVaultContract: undefined,
    merkleDistributorContract: undefined,
    imoContract: undefined,
    imoStakingContract: undefined,
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
    deployedAddresses.ideaTokenFactory,
    { from: web3.eth.defaultAccount }
  )

  const exchangeContract = new web3.eth.Contract(
    abis.ideaTokenExchangeAVM as any,
    deployedAddresses.ideaTokenExchange,
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
    UniswapFactoryABI as any,
    '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // same on all networks
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

  const drippingIMOSourceContract = new web3.eth.Contract(
    abis.drippingIMOSource as any,
    deployedAddresses.drippingIMOSource,
    { from: web3.eth.defaultAccount }
  )

  useContractStore.setState({
    factoryContract: factoryContract,
    exchangeContract: exchangeContract,
    exchangeContractL1: exchangeContractL1,
    multiActionContract: multiActionContract,
    uniswapFactoryContract: uniswapFactoryContract,
    ideaTokenVaultContract: ideaTokenVaultContract,
    merkleDistributorContract: merkleDistributorContract,
    imoContract: imoContract,
    imoStakingContract: imoStakingContract,
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

export function getUniswapPairContract(pairAddress: string) {
  const web3 = useWalletStore.getState().web3
  return web3
    ? new web3.eth.Contract(UniswapPairABI as any, pairAddress, {
        from: web3.eth.defaultAccount,
      })
    : null
}
