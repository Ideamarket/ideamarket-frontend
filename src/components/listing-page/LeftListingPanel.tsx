import WatchingStar from 'components/WatchingStar'
import { ZERO_ADDRESS } from 'utils'
import { IdeaMarket, IdeaToken } from 'store/ideaMarketsStore'
import { IMarketSpecifics } from 'store/markets'
import { LeftListingSkeleton } from './LeftListingSkeleton'
import UnverifiedListing from './UnverifiedListing'
import VerifiedListing from './VerifiedListing'
import Permalink from './Permalink'
import ListingIframe from './ListingIframe'
import { useMixPanel } from 'utils/mixPanel'

type LeftListingPanelProps = {
  isLoading: boolean
  market: IdeaMarket
  token: IdeaToken
  claimableIncome: string
  marketSpecifics: IMarketSpecifics
  refetch: () => void
  rawMarketName: string
  rawTokenName: string
}

export default function LeftListingPanel({
  isLoading,
  market,
  token,
  claimableIncome,
  marketSpecifics,
  refetch,
  rawMarketName,
  rawTokenName,
}: LeftListingPanelProps) {
  const { mixpanel } = useMixPanel()

  return (
    <div className="flex flex-col">
      <div className="h-full p-5 mb-5 bg-white border rounded-md dark:bg-gray-700 dark:border-gray-500 md:mr-5 border-brand-border-gray">
        <div className="relative">
          {isLoading ? (
            <LeftListingSkeleton token={token} />
          ) : (
            <>
              {token.tokenOwner === ZERO_ADDRESS ? (
                <UnverifiedListing
                  claimableInterest={claimableIncome}
                  marketSpecifics={marketSpecifics}
                  market={market}
                  token={token}
                  mixpanel={mixpanel}
                />
              ) : (
                <VerifiedListing
                  token={token}
                  refetch={refetch}
                  claimableInterest={claimableIncome}
                />
              )}

              <WatchingStar className="absolute top-0 right-0" token={token} />
            </>
          )}
        </div>

        <div>
          <Permalink token={token} />

          <ListingIframe
            rawMarketName={rawMarketName}
            rawTokenName={rawTokenName}
          />
        </div>
      </div>
    </div>
  )
}
