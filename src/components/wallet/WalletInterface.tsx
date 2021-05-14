import { useState, useContext } from 'react'
import { useWalletStore, setWeb3, unsetWeb3 } from 'store/walletStore'
import { GlobalContext } from 'pages/_app'

import CircleSpinner from '../animations/CircleSpinner'
import Metamask from '../../assets/metamask.svg'
import WalletConnect from '../../assets/walletconnect.svg'
import Coinbase from '../../assets/coinbase.svg'
import Fortmatic from '../../assets/fortmatic.svg'
import Portis from '../../assets/portis.svg'
import DotRed from '../../assets/dotred.svg'
import DotGreen from '../../assets/dotgreen.svg'

import * as wallets from 'wallets'
import classNames from 'classnames'
import A from 'components/A'

export default function WalletInterface({
  onWalletConnected,
}: {
  onWalletConnected?: () => void
}) {
  const [connectingWallet, setConnectingWallet] = useState(0)
  const {
    onWalletConnectedCallback,
    setOnWalletConnectedCallback,
  } = useContext(GlobalContext)
  const web3 = useWalletStore((state) => state.web3)
  const address = useWalletStore((state) => state.address)

  async function onWalletClicked(wallet) {
    setConnectingWallet(wallet)

    let web3
    try {
      web3 = await wallets.connect(wallet)
    } catch (ex) {
      console.log(ex)
      return
    } finally {
      setConnectingWallet(0)
    }

    await setWeb3(web3, wallet)

    if (onWalletConnectedCallback) {
      onWalletConnectedCallback()
      setOnWalletConnectedCallback(undefined)
    }

    if (onWalletConnected) {
      onWalletConnected()
    }
  }

  async function onDisconnectClicked() {
    try {
      const wallet = parseInt(localStorage.getItem('WALLET_TYPE'))
      await wallets.disconnect(wallet)
    } catch (ex) {
      console.log(ex)
    }

    unsetWeb3()
  }

  function WalletButton({
    svg,
    name,
    wallet,
    rightSvg,
  }: {
    svg: JSX.Element
    name: string
    wallet?: number
    rightSvg?: JSX.Element
  }) {
    return (
      <div className="flex pl-4 pr-4 mt-4">
        <button
          disabled={connectingWallet !== 0}
          onClick={() => onWalletClicked(wallet)}
          className={classNames(
            connectingWallet === 0
              ? 'hover:border-transparent hover:bg-brand-blue hover:text-brand-gray cursor-pointer'
              : 'cursor-not-allowed',
            connectingWallet === wallet &&
              'border-transparent bg-brand-blue text-brand-gray',
            'flex-grow p-2 text-lg text-black dark:text-gray-300 dark:border-gray-500 border-2 rounded-lg border-brand-gray-1 font-sf-compact-medium'
          )}
        >
          <div className="flex flex-row items-center">
            <div className="flex-none">{svg}</div>
            <div className="ml-2 text-left">{name}</div>
            <div
              className={classNames(
                connectingWallet !== wallet && 'display: hidden',
                'flex flex-row justify-end flex-grow'
              )}
            >
              <CircleSpinner color="white" bgcolor="#0857e0" />
            </div>
            {rightSvg && (
              <div className="flex flex-row justify-end pl-2 ml-auto">
                {rightSvg}
              </div>
            )}
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden lg:min-w-100">
      <div className="transition-all duration-1000 ease-in-out">
        <WalletButton
          svg={<Metamask className="w-8 h-8" />}
          name="Metamask"
          wallet={wallets.WALLETS.METAMASK}
        />
        <WalletButton
          svg={<WalletConnect className="w-8 h-8" />}
          name="WalletConnect"
          wallet={wallets.WALLETS.WALLETCONNECT}
        />
        <WalletButton
          svg={<Coinbase className="w-7 h-7" />}
          name="Coinbase"
          wallet={wallets.WALLETS.COINBASE}
        />
        <WalletButton
          svg={<Fortmatic className="w-7 h-7" />}
          name="Fortmatic"
          wallet={wallets.WALLETS.FORTMATIC}
        />
        <WalletButton
          svg={<Portis className="w-7 h-7" />}
          name="Portis"
          wallet={wallets.WALLETS.PORTIS}
        />
      </div>
      <hr className="m-4" />
      <div className="flex flex-row items-center mx-4 mb-4 ">
        {web3 === undefined && <DotRed className="w-3 h-3" />}
        {web3 !== undefined && <DotGreen className="w-3 h-3" />}
        <p className="ml-2 text-brand-gray-2">
          {address !== '' ? 'Connected with: ' : 'Not connected'}
          {address !== '' && (
            <A
              className="underline"
              href={`https://etherscan.io/address/${address}`}
              target="_blank"
              rel="noreferrer"
            >
              {address.slice(0, 6)}...{address.slice(-4)}
            </A>
          )}
        </p>
        <div className="flex justify-end flex-grow">
          <button
            disabled={web3 === undefined}
            onClick={onDisconnectClicked}
            className={classNames(
              web3 !== undefined
                ? 'hover:border-transparent hover:bg-brand-blue hover:text-brand-gray cursor-pointer'
                : 'cursor-not-allowed',
              'p-2 text-xs text-center border-2 rounded-lg text-brand-gray-2 dark:border-gray-500 border-brand-gray-1 font-sf-compact-medium'
            )}
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  )
}
