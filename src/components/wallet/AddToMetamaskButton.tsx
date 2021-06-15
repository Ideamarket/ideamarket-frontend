import classNames from 'classnames'
import Metamask from '../../assets/metamask.svg'
import { IdeaToken } from 'store/ideaMarketsStore'
import { useWalletStore } from 'store/walletStore'

export default function AddToMetamaskButton({ token }: { token: IdeaToken }) {
  const web3 = useWalletStore((state) => state.web3)
  const disabled = !web3 || !token

  async function onClick(e) {
    e.stopPropagation()

    try {
      const { ethereum } = window as any
      await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: token.address,
            symbol: `IDT`,
            decimals: 18,
            image: 'https://app.ideamarket.io/logo.png',
          },
        },
      })
    } catch (ex) {
      // We don't handle that error for now
      // Might be a different wallet than Metmask
      // or user declined
      console.log(ex)
    }
  }

  return (
    <>
      <button
        className="text-brand-gray-2 dark:text-gray-300 underline"
        onClick={onClick}
        disabled={disabled}
      >
        Add to Metamask
      </button>
    </>
  )
}
