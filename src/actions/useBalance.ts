import { useState, useEffect } from 'react'
import { ZERO_ADDRESS, web3BNToFloatString } from '../utils'
import { useWalletStore } from 'store/walletStore'
import { getERC20Contract } from 'store/contractStore'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'

export default function useBalance(
  tokenAddress: string, // This can be token or contract address
  userAddress: string, // This can be wallet or contract address. It's address you want to get balance of
  decimals: number,
  refreshToggle?: boolean // Used to refresh balance whenever needed
) {
  const [isLoading, setIsLoading] = useState(true)
  const [balanceBN, setBalanceBN] = useState(undefined)
  const [balance, setBalance] = useState(undefined)

  // Need walletAddress to detect when user changes wallet accounts
  const { web3, walletAddress } = useWalletStore((state) => ({
    web3: state.web3,
    walletAddress: state.address,
  }))

  useEffect(() => {
    let isCancelled = false

    function getBalance() {
      return new Promise<BN>((resolve) => {
        if (!web3 || !tokenAddress) {
          resolve(new BN('0'))
          return
        }

        try {
          if (tokenAddress === ZERO_ADDRESS) {
            web3.eth
              .getBalance(userAddress)
              .then((value) => {
                resolve(new BN(value))
              })
              .catch((error) => {
                console.error('Getting balance of ETH failed', error)
                resolve(new BN('0'))
              })
          } else {
            const contract = getERC20Contract(tokenAddress)
            contract.methods
              .balanceOf(userAddress)
              .call()
              .then((value) => {
                resolve(new BN(value))
              })
              .catch((error) => {
                console.error('Getting balance of ERC20 failed', error)
                resolve(new BN('0'))
              })
          }
        } catch (error) {
          resolve(new BN('0'))
        }
      })
    }

    async function run() {
      const bn = await getBalance()
      if (!isCancelled) {
        const pow = new BigNumber('10').pow(new BigNumber(decimals))
        setBalanceBN(bn)
        setBalance(web3BNToFloatString(bn, pow, 4, BigNumber.ROUND_DOWN))
        setIsLoading(false)
      }
    }

    setIsLoading(true)
    run()

    return () => {
      isCancelled = true
    }
  }, [tokenAddress, web3, walletAddress, userAddress, refreshToggle, decimals])

  return [balance, balanceBN, isLoading]
}
