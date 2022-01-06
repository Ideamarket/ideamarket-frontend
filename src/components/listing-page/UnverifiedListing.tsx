import ModalService from 'components/modals/ModalService'
import VerifyModal from 'components/VerifyModal'

export default function UnverifiedListing({
  claimableInterest,
  marketSpecifics,
  market,
  token,
  mixpanel,
}) {
  return (
    <div className="flex flex-col items-center text-xl">
      <span>Claimable interest</span>
      <span className="font-semibold">
        ${claimableInterest <= 0 ? '0' : claimableInterest}
      </span>
      <div className="mt-5 mb-2 text-sm md:mb-5 text-brand-blue dark:text-blue-500">
        {marketSpecifics.isVerificationEnabled() ? (
          <button
            className="flex items-center justify-center w-64 h-12 font-semibold text-center bg-white border-2 rounded-lg dark:bg-gray-500 dark:text-gray-300 hover:bg-brand-blue hover:text-white border-brand-blue text-brand-blue"
            onClick={() => {
              mixpanel.track('CLAIM_INCOME_STREAM', {
                token: token.name,
                market: market.name,
              })

              ModalService.open(VerifyModal, { market, token })
            }}
          >
            Claim your new income stream
          </button>
        ) : (
          <div>Verification not yet enabled</div>
        )}
      </div>
    </div>
  )
}
