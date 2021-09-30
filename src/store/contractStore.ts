import create from 'zustand'
import Web3 from 'web3'
import UniswapFactoryABI from '../assets/abi-uniswap-factory.json'
import UniswapPairABI from '../assets/abi-uniswap-pair.json'
import ERC20ABI from '../assets/abi-erc20.json'
import { useWalletStore } from './walletStore'
import { NETWORK } from 'store/networks'

type State = {
  daiContract: any
  factoryContract: any
  exchangeContract: any
  multiActionContract: any
  uniswapFactoryContract: any
  ideaTokenVaultContract: any
  merkleDistributorContract: any
}

export const useContractStore = create<State>((set) => ({
  daiContract: undefined,
  factoryContract: undefined,
  exchangeContract: undefined,
  multiActionContract: undefined,
  uniswapFactoryContract: undefined,
  ideaTokenVaultContract: undefined,
  merkleDistributorContract: undefined,
}))

export function clearContracts() {
  useContractStore.setState({
    daiContract: undefined,
    factoryContract: undefined,
    exchangeContract: undefined,
    multiActionContract: undefined,
    uniswapFactoryContract: undefined,
    ideaTokenVaultContract: undefined,
    merkleDistributorContract: undefined,
  })
}

export function initContractsFromWeb3(web3: Web3) {
  const deployedAddresses = NETWORK.getDeployedAddresses()
  const abis = NETWORK.getDeployedABIs()

  const daiContract = new web3.eth.Contract(
    ERC20ABI as any,
    NETWORK.getExternalAddresses().dai,
    {
      from: web3.eth.defaultAccount,
    }
  )

  const factoryContract = new web3.eth.Contract(
    abis.ideaTokenFactory as any,
    deployedAddresses.ideaTokenFactory,
    { from: web3.eth.defaultAccount }
  )

  const exchangeContract = new web3.eth.Contract(
    abis.ideaTokenExchange as any,
    deployedAddresses.ideaTokenExchange,
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

  useContractStore.setState({
    daiContract: daiContract,
    factoryContract: factoryContract,
    exchangeContract: exchangeContract,
    multiActionContract: multiActionContract,
    uniswapFactoryContract: uniswapFactoryContract,
    ideaTokenVaultContract: ideaTokenVaultContract,
    merkleDistributorContract: merkleDistributorContract,
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
