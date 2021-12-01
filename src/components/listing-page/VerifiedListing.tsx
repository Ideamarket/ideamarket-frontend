import { withdrawTokenInterest } from 'actions'
import classNames from 'classnames'
import A from 'components/A'
import TxPending from 'components/trade/TxPending'
import { useWalletStore } from 'store/walletStore'
import { useTransactionManager, ZERO_ADDRESS } from 'utils'

export default function VerifiedListing({ token, refetch, claimableInterest }) {
  const web3 = useWalletStore((state) => state.web3)
  const connectedAddress = useWalletStore((state) => state.address)
  const txManager = useTransactionManager()

  async function onWithdrawClicked() {
    try {
      await txManager.executeTx(
        'Withdraw',
        withdrawTokenInterest,
        token.address
      )
      refetch()
    } catch (ex) {
      console.log(ex)
    }
  }

  return (
    <div>
      <div className="inline-block">
        <div className="text-sm font-semibold text-brand-new-dark dark:text-gray-400">
          Listing Owner
        </div>
        <div className="mt-2 text-base font-semibold text-brand-new-dark dark:text-gray-300">
          {ZERO_ADDRESS === token.tokenOwner ? (
            'None'
          ) : (
            <A
              href={`https://etherscan.io/address/${token.tokenOwner}`}
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              {`${token.tokenOwner.slice(0, 8)}...${token.tokenOwner.slice(
                -6
              )}`}
            </A>
          )}
        </div>
      </div>
      <div className="mt-5 mb-3 text-sm font-semibold md:mt-8 text-brand-gray-2 dark:text-gray-400">
        Listing Owner Options
      </div>
      <div className="font-medium text-brand-gray-2">
        <div className="text-xs">
          {!web3 ||
          connectedAddress.toLowerCase() !== token.tokenOwner.toLowerCase()
            ? `The owner of this listing is ${token.tokenOwner.slice(
                0,
                8
              )}...${token.tokenOwner.slice(
                -6
              )}. This address does not match the wallet you have connected. If you are the owner of this listing please connect the correct wallet to be able to withdraw interest.`
            : 'Your connected wallet owns this listing.'}
        </div>
      </div>
      <div className="mt-2.5 text-sm text-brand-blue dark:text-gray-200">
        Available interest: {claimableInterest} DAI
      </div>
      <div className="flex mt-3 mb-2 text-sm md:mb-5 text-brand-blue">
        <button
          disabled={
            !web3 ||
            txManager.isPending ||
            connectedAddress.toLowerCase() !== token.tokenOwner.toLowerCase()
          }
          className={classNames(
            'font-semibold text-sm text-brand-blue',
            !web3 ||
              connectedAddress.toLowerCase() !== token.tokenOwner.toLowerCase()
              ? 'hidden'
              : txManager.isPending
              ? 'cursor-default'
              : 'cursor-pointer hover:underline'
          )}
          onClick={onWithdrawClicked}
        >
          Withdraw
        </button>
      </div>
      <TxPending txManager={txManager} />
    </div>
  )
}
