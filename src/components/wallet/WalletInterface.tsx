import { useState, useContext, useEffect } from 'react'
import { setWeb3, unsetWeb3 } from 'store/walletStore'
import { GlobalContext } from 'pages/_app'

import CircleSpinner from '../animations/CircleSpinner'
import Metamask from '../../assets/metamask.svg'
import WalletConnect from '../../assets/walletconnect.svg'
import Coinbase from '../../assets/coinbase.svg'
import Fortmatic from '../../assets/fortmatic.svg'
import Portis from '../../assets/portis.svg'
import Torus from '../../assets/torus.svg'
import DotRed from '../../assets/dotred.svg'
import DotGreen from '../../assets/dotgreen.svg'

import classNames from 'classnames'
import A from 'components/A'
import { useWeb3React } from '@web3-react/core'
import {
  resetWalletConnector,
  disconnectWalletConnector,
  connectorsById,
  ConnectorIds,
} from 'wallets/connectors/index'

export default function WalletInterface({
  onWalletConnected,
}: {
  onWalletConnected?: () => void
}) {
  const [connectingWallet, setConnectingWallet] = useState(0)
  const { onWalletConnectedCallback, setOnWalletConnectedCallback } =
    useContext(GlobalContext)

  const { active, account, library, connector, activate, deactivate } =
    useWeb3React()

  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = useState<any>()

  useEffect(() => {
    const setWeb3WithWait = async () => {
      await setWeb3(library, connectingWallet)

      if (onWalletConnectedCallback) {
        onWalletConnectedCallback()
        setOnWalletConnectedCallback(undefined)
      }

      if (onWalletConnected) {
        onWalletConnected()
      }
    }

    if (activatingConnector && activatingConnector === connector) {
      // Wait until connector is set, THEN you can set web3
      if (library) {
        setWeb3WithWait()
      } else {
        // Connecting to wallet cancelled or failed
        if (connectingWallet === ConnectorIds.WalletConnect) {
          // You need to reset WalletConnector before you can reconnect to it and show QRcode again: https://github.com/NoahZinsmeister/web3-react/issues/124
          resetWalletConnector(activatingConnector)
        }
        // After connecting to a wallet fails, it disconnects any previous wallet, so we try to reconnect
        const walletStr = localStorage.getItem('WALLET_TYPE')
        const previousConnector = connectorsById[parseInt(walletStr)]
        activate(previousConnector)
      }

      setConnectingWallet(0)
      setActivatingConnector(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activatingConnector, connector])

  async function onWalletClicked(wallet) {
    setConnectingWallet(wallet)
    const currentConnector = connectorsById[wallet]
    setActivatingConnector(currentConnector)

    try {
      await activate(currentConnector)
    } catch (ex) {
      console.log(ex)
      return
    }
  }

  async function onDisconnectClicked() {
    await disconnectWalletConnector(connector)

    try {
      await deactivate()
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
          wallet={ConnectorIds.Metamask}
        />
        <WalletButton
          svg={<WalletConnect className="w-8 h-8" />}
          name="WalletConnect"
          wallet={ConnectorIds.WalletConnect}
        />
        <WalletButton
          svg={<Coinbase className="w-7 h-7" />}
          name="Coinbase"
          wallet={ConnectorIds.Coinbase}
        />
        <WalletButton
          svg={<Fortmatic className="w-7 h-7" />}
          name="Fortmatic"
          wallet={ConnectorIds.Fortmatic}
        />
        <WalletButton
          svg={<Portis className="w-7 h-7" />}
          name="Portis"
          wallet={ConnectorIds.Portis}
        />
        <WalletButton
          svg={<Torus className="w-6 h-6" />}
          name="Torus"
          wallet={ConnectorIds.Torus}
        />
      </div>
      <hr className="m-4" />
      <div className="flex flex-row items-center mx-4 mb-4 ">
        {!active && <DotRed className="w-3 h-3" />}
        {active && <DotGreen className="w-3 h-3" />}
        <p className="ml-2 text-brand-gray-2">
          {active ? 'Connected with: ' : 'Not connected'}
          {active && (
            <A
              className="underline"
              href={`https://etherscan.io/address/${account}`}
              target="_blank"
              rel="noreferrer"
            >
              {account.slice(0, 6)}...{account.slice(-4)}
            </A>
          )}
        </p>
        <div className="flex justify-end flex-grow">
          <button
            disabled={!active}
            onClick={onDisconnectClicked}
            className={classNames(
              active
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
