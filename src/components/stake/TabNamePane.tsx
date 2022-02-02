import { useBalance, useTotalSupply } from 'actions'
import useIMOPayoutAmount from 'actions/useIMOPayoutAmount'
import useStakingAPR from 'actions/useStakingAPR'
import classNames from 'classnames'
import { STAKE_TYPES } from 'pages/stake'
import { useEffect, useState } from 'react'
import { NETWORK } from 'store/networks'
import { formatNumberWithCommasAsThousandsSerperator } from 'utils'

type Props = {
  stakeType: STAKE_TYPES
  onClickStakeType: (s: STAKE_TYPES) => void
}

const imoAddress = NETWORK.getDeployedAddresses().imo
const imoStakingAddress = NETWORK.getDeployedAddresses().imoStaking
const dripIMOSourceAddress =
  NETWORK.getDeployedAddresses().drippingIMOSourceContract

export default function TabNamePane({ stakeType, onClickStakeType }: Props) {
  const [lockingAPR, setLockingAPR] = useState(undefined)
  useEffect(() => {
    fetch(
      `${
        process.env.IDEAMARKET_BACKEND_HOST || 'http://server-dev.ideamarket.io'
      }/general/apr`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setLockingAPR(Number(data.data.apr))
        } else setLockingAPR(0)
      })
      .catch((err) => setLockingAPR(0))
  }, [])

  const [balanceToggle] = useState(false) // Need toggle to reload balance after stake/unstake
  const [, stakingContractIMOBalanceBN] = useBalance(
    imoAddress,
    imoStakingAddress,
    18,
    balanceToggle
  )
  const [, xIMOTotalSupplyBN] = useTotalSupply(
    imoStakingAddress,
    18,
    balanceToggle
  )
  const [, dripSourceIMOBalanceBN] = useBalance(
    imoAddress,
    dripIMOSourceAddress,
    18,
    balanceToggle
  )
  const [, ratioImoAmountBN] = useIMOPayoutAmount(
    '1',
    stakingContractIMOBalanceBN,
    xIMOTotalSupplyBN,
    dripSourceIMOBalanceBN
  )
  const [apr] = useStakingAPR(
    ratioImoAmountBN,
    stakingContractIMOBalanceBN,
    xIMOTotalSupplyBN
  )

  return (
    <div
      className="grid text-white font-gilroy-bold pt-20 overflow-auto"
      style={{
        background: 'linear-gradient(180deg, #011032 0%, #02194D 100%)',
        gridTemplateColumns: 'repeat(3, minmax(12rem, 1fr))',
      }}
    >
      <div
        className={classNames(
          'flex flex-col lg:flex-row items-center m-auto pb-6 border-brand-light-green cursor-pointer px-2 min-w-[15rem]',
          stakeType === STAKE_TYPES.LISTING ? 'border-b-4' : 'border-b-none'
        )}
        onClick={() => onClickStakeType(STAKE_TYPES.LISTING)}
      >
        <h3
          className={classNames(
            'text-3xl whitespace-nowrap',
            stakeType === STAKE_TYPES.LISTING ? '' : 'opacity-50'
          )}
        >
          Lock Listings
        </h3>
        <span
          className={classNames(
            'text-xl px-3 py-1 ml-2 rounded-lg',
            stakeType === STAKE_TYPES.LISTING
              ? 'bg-brand-light-green'
              : 'text-brand-light-green'
          )}
        >
          {lockingAPR
            ? formatNumberWithCommasAsThousandsSerperator(lockingAPR.toFixed(2))
            : 0}
          % APR
        </span>
      </div>
      <div
        className={classNames(
          'flex flex-col lg:flex-row items-center m-auto pb-6 border-brand-light-green cursor-pointer px-2 min-w-[15rem]',
          stakeType === STAKE_TYPES.IMO ? 'border-b-4' : 'border-b-none'
        )}
        onClick={() => onClickStakeType(STAKE_TYPES.IMO)}
      >
        <h3
          className={classNames(
            'text-3xl whitespace-nowrap',
            stakeType === STAKE_TYPES.IMO ? '' : 'opacity-50'
          )}
        >
          Stake IMO
        </h3>
        <span
          className={classNames(
            'text-xl px-3 py-1 ml-2 rounded-lg',
            stakeType === STAKE_TYPES.IMO
              ? 'bg-brand-light-green'
              : 'text-brand-light-green'
          )}
        >
          {apr
            ? formatNumberWithCommasAsThousandsSerperator(apr.toFixed(2))
            : 0}
          % APR
        </span>
      </div>
      <div
        className={classNames(
          'flex flex-col lg:flex-row items-center m-auto pb-6 border-brand-light-green cursor-pointer px-2 min-w-[15rem]',
          stakeType === STAKE_TYPES.ETH_IMO ? 'border-b-4' : 'border-b-none'
        )}
        onClick={() => onClickStakeType(STAKE_TYPES.ETH_IMO)}
      >
        <h3
          className={classNames(
            'text-3xl whitespace-nowrap',
            stakeType === STAKE_TYPES.ETH_IMO ? '' : 'opacity-50'
          )}
        >
          Stake ETH-IMO
        </h3>
        <span
          className={classNames(
            'text-xl px-3 py-1 ml-2 rounded-lg',
            stakeType === STAKE_TYPES.ETH_IMO
              ? 'bg-brand-light-green'
              : 'text-brand-light-green'
          )}
        >
          350% APR
        </span>
      </div>
    </div>
  )
}
