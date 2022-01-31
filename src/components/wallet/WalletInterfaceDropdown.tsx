import { useState, useContext, useEffect } from 'react'
import { setWeb3, unsetWeb3 } from 'store/walletStore'
import { GlobalContext } from 'pages/_app'
import mixpanel from 'mixpanel-browser'
import CircleSpinner from '../animations/CircleSpinner'
import Metamask from '../../assets/metamask.svg'
import WalletConnect from '../../assets/walletconnect.svg'
import Coinbase from '../../assets/coinbase.svg'
import Fortmatic from '../../assets/fortmatic.svg'
import Portis from '../../assets/portis.svg'
import { IoMdExit } from 'react-icons/io'

import classNames from 'classnames'
import { useWeb3React } from '@web3-react/core'
import {
  resetWalletConnector,
  disconnectWalletConnector,
  connectorsById,
  ConnectorIds,
} from 'wallets/connectors/index'
import { Tooltip } from 'components'
import getConfig from 'next/config'
import A from 'components/A'

const { publicRuntimeConfig } = getConfig()
const { MIX_PANEL_KEY } = publicRuntimeConfig

// Workaround since modal is not wrapped by the mixPanel interface
mixpanel.init(MIX_PANEL_KEY)

export default function WalletInterfaceDropdown({
  onWalletConnected,
  onWalletConnectFailed,
  onWalletClickedToConnect,
  walletButtonClassName,
}: {
  onWalletConnected?: () => void
  onWalletConnectFailed?: () => void
  onWalletClickedToConnect?: () => void
  walletButtonClassName?: string
}) {
  const [connectingWallet, setConnectingWallet] = useState(0)
  const { onWalletConnectedCallback, setOnWalletConnectedCallback } =
    useContext(GlobalContext)

  const { library, connector, activate, deactivate, active } = useWeb3React()

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

        if (onWalletConnectFailed) {
          onWalletConnectFailed()
        }
      }

      setConnectingWallet(0)
      setActivatingConnector(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activatingConnector, connector])

  async function onWalletClicked(wallet) {
    if (onWalletClickedToConnect) {
      onWalletClickedToConnect()
    }
    setConnectingWallet(wallet)
    const currentConnector = connectorsById[wallet]
    setActivatingConnector(currentConnector)

    try {
      await activate(currentConnector)
    } catch (ex) {
      console.log(ex)
      return
    }

    mixpanel.track('ADD_WALLET_COMPLETED', {
      walletId: wallet,
    })
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
    isDisabled = false,
    rightSvg,
    withoutBorder = false,
  }: {
    svg: JSX.Element
    name: string
    wallet?: number
    isDisabled?: boolean
    rightSvg?: JSX.Element
    withoutBorder?: boolean
  }) {
    return (
      <div
        className={classNames(
          'relative flex py-4 px-5 hover:bg-brand-gray',
          withoutBorder ? '' : 'border-t border-gray-100',
          'w-96 md:w-auto'
        )}
      >
        {isDisabled && (
          <Tooltip
            className="absolute right-0 w-full h-full cursor-not-allowed"
            IconComponent={() => <></>}
          >
            Arbitrum support coming soon
          </Tooltip>
        )}
        <button
          disabled={connectingWallet !== 0 || isDisabled}
          onClick={() => onWalletClicked(wallet)}
          className={classNames(
            connectingWallet === 0 && !isDisabled
              ? 'cursor-pointer'
              : 'cursor-not-allowed',
            'flex-grow text-lg text-black rounded-lg',
            isDisabled && 'bg-brand-gray',
            walletButtonClassName || ''
          )}
        >
          <div className="flex flex-row items-center">
            <div className="flex-none">{svg}</div>
            <div className="ml-2 text-left font-medium text-sm">{name}</div>
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
    <div className="relative overflow-hidden w-full">
      <div className="transition-all duration-1000 ease-in-out">
        <WalletButton
          svg={<Metamask className="w-6 h-6" />}
          name="Metamask"
          wallet={ConnectorIds.Metamask}
          withoutBorder={true}
        />
        <WalletButton
          svg={<WalletConnect className="w-6 h-6" />}
          name="WalletConnect"
          wallet={ConnectorIds.WalletConnect}
        />
        <WalletButton
          svg={<Coinbase className="w-6 h-6" />}
          name="Coinbase"
          wallet={ConnectorIds.Coinbase}
        />
        <WalletButton
          svg={<Portis className="w-6 h-6" />}
          name="Portis"
          wallet={ConnectorIds.Portis}
        />
        <WalletButton
          svg={<Fortmatic className="w-6 h-6" />}
          name="Fortmatic"
          wallet={ConnectorIds.Fortmatic}
        />
      </div>
      {active ? (
        <div
          className="cursor-pointer flex items-center py-4 px-5 border-t border-gray-100 hover:bg-brand-gray"
          onClick={onDisconnectClicked}
        >
          <IoMdExit className="w-6 h-6  text-gray-400" />
          <span className="ml-2 font-medium text-sm">Disconnect Wallet</span>
        </div>
      ) : (
        <div
          className="cursor-pointer flex flex-col items-center py-3 px-4 font-medium text-white bg-brand-blue"
          onClick={onDisconnectClicked}
        >
          <A href="http://metamask.io">
            <p className="text-sm">I don’t have a wallet</p>
            <p className="text-xs opacity-70">
              Learn how to get one{' '}
              <span>
                <IoMdExit className="w-4 h-4" />
              </span>
            </p>
          </A>
        </div>
      )}
    </div>
  )
}
