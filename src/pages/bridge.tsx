import classNames from 'classnames'
import { NextSeo } from 'next-seo'
import { useEffect, useState, useContext, ReactElement } from 'react'
import { IdeaTokenMarketPair } from 'store/ideaMarketsStore'
import { useWalletStore } from 'store/walletStore'
import { IMarketSpecifics, getMarketSpecificsByMarketName } from 'store/markets'
import { getL1Network, NETWORK } from 'store/networks'
import { formatNumber, isAddress, useTransactionManager } from 'utils'
import { useTokenIconURL, migrateTokensToArbitrum } from 'actions'
import { L1TokenTable, Footer, DefaultLayout, WalletModal, A } from 'components'
import { GlobalContext } from './_app'
import ModalService from 'components/modals/ModalService'
import Wand from '../assets/wand.svg'
import CircleSpinner from 'components/animations/CircleSpinner'
import { useMixPanel } from 'utils/mixPanel'

export default function Bridge() {
  const { mixpanel } = useMixPanel()
  const l1Network = getL1Network(NETWORK)
  const { setRequiredNetwork } = useContext(GlobalContext)
  useEffect(() => {
    setRequiredNetwork(l1Network)

    return () => {
      setRequiredNetwork(NETWORK)
    }
  }, [setRequiredNetwork, l1Network])

  const connectedAddress = useWalletStore((state) => state.address)
  const isWalletConnected = connectedAddress !== ''

  const [l2Recipient, setL2Recipient] = useState<string>('')
  const isValidL2Recipient = isAddress(l2Recipient)

  const [selectedPair, setSelectedPair] = useState<IdeaTokenMarketPair>(null)
  const [isPairSelected, setIsPairSelected] = useState<boolean>(false)

  const [marketSpecifics, setMarketSpecifics] = useState<IMarketSpecifics>(null)

  const [tokenIconURLParams, setTokenIconURLParams] = useState({
    marketSpecifics: null,
    tokenName: null,
  })
  const { tokenIconURL, isLoading: isTokenIconLoading } =
    useTokenIconURL(tokenIconURLParams)

  const txManager = useTransactionManager()

  const migrateButtonDisabled =
    !isPairSelected || !isValidL2Recipient || txManager.isPending

  useEffect(() => {
    if (selectedPair) {
      const specifics = getMarketSpecificsByMarketName(selectedPair.market.name)

      setMarketSpecifics(specifics)
      setTokenIconURLParams({
        marketSpecifics: specifics,
        tokenName: selectedPair.token.name,
      })
      setIsPairSelected(true)
    }
  }, [selectedPair])

  async function migrateButtonClicked() {
    try {
      await txManager.executeTx(
        'Migrate',
        migrateTokensToArbitrum,
        selectedPair.market.marketID,
        selectedPair.token.tokenID,
        l2Recipient
      )

      mixpanel.track('BRIDGE_COMPLETED')
    } catch (ex) {
      console.log(ex)
      return
    }
  }

  return (
    <>
      <NextSeo title="Bridge" />
      <div className="min-h-screen bg-brand-gray">
        <div className="h-64 px-4 pt-8 pb-5 text-white md:px-6 md:pt-6 bg-top-mobile md:bg-top-desktop md:h-96">
          <div className="mx-auto md:px-4 max-w-88 md:max-w-304">
            <div className="flex items-center justify-center text-6xl font-bold">
              L2 Bridge
            </div>
            <div className="flex items-center justify-center text-lg mt-2.5 text-gray-200 text-center">
              Migrate your Ideatokens to Arbitrum's layer 2
            </div>

            <div
              className={classNames(
                'mt-10 bg-white border rounded-lg',
                !isWalletConnected && 'h-96'
              )}
            >
              {!isWalletConnected ? (
                <div className="flex items-center justify-center w-full h-full">
                  <button
                    onClick={() => {
                      ModalService.open(WalletModal)
                    }}
                    className="p-2.5 text-base font-medium text-white border-2 rounded-lg border-brand-blue tracking-tightest-2 font-sf-compact-medium bg-brand-blue"
                  >
                    Connect wallet to view
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center pb-10 mt-10 text-black border-b border-gray-200">
                    <div
                      className={classNames(
                        'flex items-center justify-center',
                        !isPairSelected && 'h-10 w-56 bg-gray-400 rounded-md'
                      )}
                    >
                      {isPairSelected && (
                        <div className="w-6 h-6 mr-2">
                          {isPairSelected &&
                            marketSpecifics.getMarketSVGBlack()}
                        </div>
                      )}

                      <div className="w-10 h-10">
                        {!isPairSelected || isTokenIconLoading ? (
                          <div
                            className={classNames(
                              'w-full h-full bg-gray-400 rounded-full',
                              isTokenIconLoading && 'animate-pulse'
                            )}
                          ></div>
                        ) : (
                          <img
                            className="w-full h-full rounded-full"
                            src={tokenIconURL}
                            alt=""
                          />
                        )}
                      </div>

                      {isPairSelected && (
                        <div className="flex items-center h-8 ml-4 font-medium">
                          <span>
                            {isPairSelected && selectedPair.token.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <div
                      className={classNames(
                        'flex items-center justify-center mt-2.5 text-gray-400 font-medium',
                        !isPairSelected && 'h-6 w-36 bg-gray-400 rounded-md'
                      )}
                    >
                      {isPairSelected && (
                        <span>{formatNumber(selectedPair.balance)} tokens</span>
                      )}
                    </div>

                    <div className="flex flex-col items-center justify-center mt-10 md:flex-row">
                      <input
                        className={classNames(
                          'pl-2 w-full md:w-96 h-10 leading-tight border-2 rounded appearance-none focus:outline-none focus:bg-white',
                          l2Recipient === ''
                            ? 'border-gray-200 focus:border-brand-blue bg-gray-200'
                            : isValidL2Recipient
                            ? 'border-brand-green'
                            : 'border-brand-red'
                        )}
                        disabled={false}
                        value={l2Recipient}
                        onChange={(e: any) => {
                          setL2Recipient(e.target.value)
                        }}
                        placeholder="Your L2 address"
                      />
                      <button
                        className="mt-2 md:mt-0 md:ml-2.5 w-32 h-10 text-sm text-brand-blue bg-white border border-brand-blue rounded-lg tracking-tightest-2 font-sf-compact-medium hover:bg-brand-blue hover:text-white"
                        disabled={false}
                        onClick={() => {
                          connectedAddress !== undefined &&
                            connectedAddress !== '' &&
                            setL2Recipient(connectedAddress)
                        }}
                      >
                        Use connected
                      </button>
                    </div>

                    <div className="mt-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          migrateButtonClicked()
                        }}
                        className={classNames(
                          'flex items-center justify-center h-12 text-lg font-medium text-white rounded-lg w-44 tracking-tightest-2 font-sf-compact-medium',
                          migrateButtonDisabled
                            ? 'bg-gray-400 cursor-default'
                            : 'bg-brand-blue'
                        )}
                        disabled={migrateButtonDisabled}
                      >
                        <Wand className="w-6 h-6 mr-2" />
                        Migrate
                      </button>
                    </div>

                    <div
                      className={classNames(
                        'grid grid-cols-3 my-5 text-sm text-brand-new-dark font-semibold',
                        txManager.isPending ? '' : 'invisible'
                      )}
                    >
                      <div className="font-bold justify-self-center">
                        {txManager.name}
                      </div>
                      <div className="justify-self-center">
                        <A
                          className={classNames(
                            'underline',
                            txManager.hash === '' ? 'hidden' : ''
                          )}
                          href={l1Network.getEtherscanTxUrl(txManager.hash)}
                          target="_blank"
                        >
                          {txManager.hash.slice(0, 8)}...
                          {txManager.hash.slice(-6)}
                        </A>
                      </div>
                      <div className="justify-self-center">
                        <CircleSpinner color="#0857e0" />
                      </div>
                    </div>

                    <div className="mx-5 font-black text-strong">
                      NOTE: After your transaction is confirmed it can take up
                      to 20 minutes for the tokens to be available on L2.
                    </div>
                  </div>
                  <L1TokenTable setSelectedPair={setSelectedPair} />
                </>
              )}
            </div>

            <div className="px-1 mt-12">
              <Footer />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

Bridge.getLayout = (page: ReactElement) => <DefaultLayout>{page}</DefaultLayout>
