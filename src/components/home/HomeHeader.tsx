import React, { useContext } from 'react'
import { useWalletStore } from 'store/walletStore'
import { useQuery } from 'react-query'
import { NETWORK } from 'store/networks'
import { GlobalContext } from 'pages/_app'
import {
  queryCDaiBalance,
  queryExchangeRate,
  investmentTokenToUnderlying,
} from 'store/compoundStore'
import {
  web3BNToFloatString,
  bigNumberTenPow18,
  formatNumberWithCommasAsThousandsSerperator,
} from 'utils'
import ModalService from 'components/modals/ModalService'
import { ListTokenModal, WalletModal } from 'components'
import Plus from '../../assets/plus-white.svg'

const HomeHeader = ({
  setTradeOrListSuccessToggle,
  tradeOrListSuccessToggle,
}: any) => {
  const { data: compoundExchangeRate } = useQuery(
    'compound-exchange-rate',
    queryExchangeRate,
    {
      refetchOnWindowFocus: false,
    }
  )

  const { setOnWalletConnectedCallback } = useContext(GlobalContext)

  const { interestManager: interestManagerAddress } =
    NETWORK.getDeployedAddresses()

  const { data: interestManagerCDaiBalance } = useQuery(
    ['interest-manager-cdai-balance', interestManagerAddress],
    queryCDaiBalance,
    {
      refetchOnWindowFocus: false,
    }
  )

  const onListTokenClicked = () => {
    const onClose = () => setTradeOrListSuccessToggle(!tradeOrListSuccessToggle)
    if (!useWalletStore.getState().web3) {
      setOnWalletConnectedCallback(() => () => {
        ModalService.open(ListTokenModal, {}, onClose)
      })
      ModalService.open(WalletModal)
    } else {
      ModalService.open(ListTokenModal, {}, onClose)
    }
  }

  const onBrowserExtensionClick = () => {
    window.open(
      'https://chrome.google.com/webstore/detail/ideamarket/hgpemhabnkecancnpcdilfojngkoahei',
      '_blank'
    )
  }

  const cDaiBalanceInDai = formatNumberWithCommasAsThousandsSerperator(
    web3BNToFloatString(
      investmentTokenToUnderlying(
        interestManagerCDaiBalance,
        compoundExchangeRate
      ),
      bigNumberTenPow18,
      0
    )
  )

  return (
    <div className="px-6 pt-10 pb-40 text-center text-white bg-cover dark:text-gray-200 bg-top-mobile md:bg-top-desktop">
      <div>
        <h2 className="text-3xl md:text-6xl font-gilroy-bold">
          The credibility layer{' '}
          <span className="text-brand-blue">of the internet</span>
        </h2>
        <p className="mt-8 text-lg md:text-2xl font-sf-compact-medium">
          Profit by discovering the world’s best information.
        </p>
      </div>
      <div className="flex flex-col items-center justify-center md:flex-row">
        <button
          onClick={onListTokenClicked}
          className="py-2 mt-10 text-lg font-bold text-white rounded-lg w-44 font-sf-compact-medium bg-brand-blue hover:bg-blue-800"
        >
          <div className="flex flex-row items-center justify-center">
            <Plus width="30" height="30" />
            <div className="ml-0.5 md:ml-2">Add Listing</div>
          </div>
        </button>
        <button
          className="py-2 mt-3 text-lg font-bold text-white border border-white rounded-lg md:mt-10 md:ml-5 w-44 font-sf-compact-medium hover:bg-white hover:text-brand-blue"
          onClick={onBrowserExtensionClick}
        >
          Browser Extension
        </button>
      </div>
      <div className="flex flex-col items-center justify-center mt-10 text-md md:text-3xl font-gilroy-bold md:flex-row">
        <div className="text-2xl text-brand-blue md:text-5xl">
          ${cDaiBalanceInDai}
        </div>
        <div className="md:ml-2">in credibility crowdsourced</div>
      </div>
    </div>
  )
}

export default HomeHeader
