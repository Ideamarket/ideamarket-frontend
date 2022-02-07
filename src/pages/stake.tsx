import { DefaultLayout } from 'components/layouts'
import { NextSeo } from 'next-seo'
import { ReactElement, useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import getSsrBaseUrl from 'utils/getSsrBaseUrl'
import { getData } from 'lib/utils/fetch'
import LockListings from 'components/stake/LockListings'
import StakeIMO from 'components/stake/StakeIMO'
import TabNamePane from 'components/stake/TabNamePane'
import StakeEthIMOFlow from 'components/stake/StakeEthIMOFlow'
import { getLockingAPR } from 'lib/axios'

export enum STAKE_TYPES {
  LISTING,
  IMO,
  ETH_IMO,
}

export const accordionData = [
  {
    title: 'How can I maximize my rewards?',
    body: 'To earn the most in $IMO rewards, take advantage of all of the rewards programs we have running at the moment. A total of 13 million $IMO will be distributed through these rewards programs over the next 3-12 months. Locking Ideamarket listing tokens will give the highest $IMO rewards, and runs for only 3 months starting at token launch day (2/2/2022).',
  },
  {
    title: 'How do I get started on Ideamaket? ',
    body: `Just connect your wallet!
      As Ideamarket is on the Arbitrum layer 2 network, you’ll need to bridge ETH from Ethereum L1 to Arbitrum to be able to buy listing tokens, or to create new on-chain listings.
      Bridge ETH here: https://bridge.arbitrum.io
      More detail: https://docs.ideamarket.io/user-guide/tutorial`,
  },
  {
    title: 'What is IMO?',
    body: '$IMO is Ideamarket’s governance and utility token. $IMO holders can create, comment, and vote on proposals in our Commonwealth.im forum. We will gradually introduce more governance features into the Ideamarket ecosystem, beginning with Snapshot governance and a multisig. In upcoming products, $IMO will be used to pay for platform-specific features. See more details [here](https://docs.ideamarket.io/usdimo-token) and [here](https://ideamarkets.substack.com/p/introducing-imo-222022).',
  },
  {
    title: 'What is the initial distribution of $IMO?',
    body: `The distribution for IMO is as follows:
           Early investors — 10%
           Team (present & future) — 18%
           Strategic partnerships — 10%
           Retroactive Airdrop — 5%
           Ecosystem & Treasury — 25%
           Community rewards — 32%
           Listing Token staking — 5%
           $IMO staking — 3%
           Sushiswap LP rewards — 5%
           Community airdrops — 4%
           Verification rewards — 2%
           Future rewards programs: 13%

           All $IMO allocated to Ideamarket team members are subject to a 2-year
           vesting schedule — a 1-year lockup, plus a 1-year linear unlock. 85% of
           investor tokens are subject to the same schedule, with 15% unlocked
           immediately to provide liquidity on Sushiswap.`,
  },
]

const Stake = () => {
  const [stakeType, setStakeType] = useState(STAKE_TYPES.LISTING)
  const [lockingAPR, setLockingAPR] = useState(undefined)
  useEffect(() => {
    getLockingAPR()
      .then((response) => {
        const { data } = response
        if (data.success) {
          setLockingAPR(Number(data.data.apr))
        } else setLockingAPR(0)
      })
      .catch(() => setLockingAPR(0))
  }, [])

  return (
    <>
      <NextSeo title="Stake" />
      <div className="w-full flex pb-20 flex-col">
        <TabNamePane
          stakeType={stakeType}
          onClickStakeType={setStakeType}
          lockingAPR={lockingAPR}
        />
        {stakeType === STAKE_TYPES.LISTING ? (
          <LockListings lockingAPR={lockingAPR} />
        ) : stakeType === STAKE_TYPES.IMO ? (
          <StakeIMO />
        ) : (
          <StakeEthIMOFlow />
        )}
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // TODO: once feature switch is no longer needed for IMO, remove
  const baseUrl = getSsrBaseUrl(context.req)
  let imoFeature = { feature: 'IMO', enabled: false }
  try {
    const { data: imoResponse } = await getData({
      url: `${baseUrl}/api/fs?value=IMO`,
    })
    imoFeature = imoResponse
  } catch (error) {
    console.error('Failed to fetch api/fs for IMO')
  }

  if (!imoFeature.enabled) {
    return {
      redirect: {
        destination: '/404',
        permanent: false,
      },
    }
  }

  return {
    props: {},
  }
}

export default Stake

Stake.getLayout = (page: ReactElement) => <DefaultLayout>{page}</DefaultLayout>
