import { CogIcon } from '@heroicons/react/outline'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid'
import { useWeb3React } from '@web3-react/core'
import { useBalance, useTotalSupply } from 'actions'
import stakeIMO from 'actions/stakeIMO'
import useIMOPayoutAmount from 'actions/useIMOPayoutAmount'
import withdrawxIMO from 'actions/withdrawxIMO'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { A, CircleSpinner, Tooltip, WalletModal } from 'components'
import ModalService from 'components/modals/ModalService'
import AdvancedOptions from 'components/trade/AdvancedOptions'
import ApproveButton from 'components/trade/ApproveButton'
import TradeCompleteModal, {
  TRANSACTION_TYPES,
} from 'components/trade/TradeCompleteModal'
import { useState } from 'react'
import { IoMdExit } from 'react-icons/io'
import { NETWORK } from 'store/networks'
import {
  floatToWeb3BN,
  formatNumberWithCommasAsThousandsSerperator,
  oneBigNumber,
  useTransactionManager,
} from 'utils'
import { LockingAccordion } from './LockingAccordion'
import StakePriceItem from './StakePriceItem'
import Image from 'next/image'
import { accordionData } from 'pages/stake'

const imoAddress = NETWORK.getDeployedAddresses().imo
const imoStakingAddress = NETWORK.getDeployedAddresses().imoStaking
const dripIMOSourceAddress =
  NETWORK.getDeployedAddresses().drippingIMOSourceContract

const StakeIMO = () => {
  const [showLockInfo, setShowLockInfo] = useState(true)
  const txManager = useTransactionManager()
  const [isStakeSelected, setIsStakeSelected] = useState(true)
  const [isUnlockOnceChecked, setIsUnlockOnceChecked] = useState(false)
  const [isUnlockPermanentChecked, setIsUnlockPermanentChecked] = useState(true)
  const [isMissingAllowance, setIsMissingAllowance] = useState(false)
  const [inputAmount, setInputAmount] = useState('')
  const { account } = useWeb3React()

  const toggleIsStake = () => setIsStakeSelected(!isStakeSelected)

  const [balanceToggle, setBalanceToggle] = useState(false) // Need toggle to reload balance after stake/unstake
  const [userIMOBalance, userIMOBalanceBN, isUserIMOBalanceLoading] =
    useBalance(imoAddress, account, 18, balanceToggle)
  const [userxIMOBalance, userxIMOBalanceBN, isUserxIMOBalanceLoading] =
    useBalance(imoStakingAddress, account, 18, balanceToggle)
  const [, stakingContractIMOBalanceBN] = useBalance(
    imoAddress,
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
  const [xIMOTotalSupply, xIMOTotalSupplyBN] = useTotalSupply(
    imoStakingAddress,
    18,
    balanceToggle
  )

  // How much IMO the user will get by withdrawing xIMO
  const [imoPayoutAmount] = useIMOPayoutAmount(
    inputAmount,
    stakingContractIMOBalanceBN,
    xIMOTotalSupplyBN,
    dripSourceIMOBalanceBN
  )
  const [ratioImoAmount] = useIMOPayoutAmount(
    '1',
    stakingContractIMOBalanceBN,
    xIMOTotalSupplyBN,
    dripSourceIMOBalanceBN
  )

  const inputAmountBigNumber = new BigNumber(inputAmount).multipliedBy(
    new BigNumber('10').exponentiatedBy(18)
  )
  const userIMOBalanceBigNumber = new BigNumber(
    userIMOBalance ? userIMOBalanceBN.toString() : '0'
  )
  const userxIMOBalanceBigNumber = new BigNumber(
    userxIMOBalance ? userxIMOBalanceBN.toString() : '0'
  )
  // Need to use Big Numbers to check for really small decimal values
  const isInputAmountGTSupply = inputAmountBigNumber.isGreaterThan(
    isStakeSelected ? userIMOBalanceBigNumber : userxIMOBalanceBigNumber
  )

  const isInvalid =
    txManager.isPending ||
    parseFloat(inputAmount) <= 0 ||
    inputAmount === '' ||
    !/^\d*\.?\d*$/.test(inputAmount) ||
    isInputAmountGTSupply

  const isApproveButtonDisabled = isInvalid || !isMissingAllowance
  const isActionButtonDisabled = isInvalid || isMissingAllowance

  const maxClicked = () => {
    setInputAmount(isStakeSelected ? userIMOBalance : userxIMOBalance)
  }

  const onTradeComplete = (
    isSuccess: boolean,
    tokenName: string,
    transactionType: TRANSACTION_TYPES,
    marketName: string
  ) => {
    ModalService.open(TradeCompleteModal, {
      isSuccess,
      tokenName,
      transactionType,
      marketName,
    })
  }

  const stakeIMOClicked = async () => {
    const amountBN = floatToWeb3BN(inputAmount, 18, BigNumber.ROUND_DOWN)
    const args = [amountBN]

    try {
      await txManager.executeTx('Stake', stakeIMO, ...args)
    } catch (ex) {
      console.log(ex)
      onTradeComplete(false, 'IMO', TRANSACTION_TYPES.NONE, 'no-market')
      return
    }

    setBalanceToggle(!balanceToggle)
    onTradeComplete(true, 'IMO', TRANSACTION_TYPES.STAKE, 'no-market')
  }

  const withdrawxIMOClicked = async () => {
    let amountBN = floatToWeb3BN(inputAmount, 18, BigNumber.ROUND_DOWN)
    const amountBigNumber = new BigNumber(amountBN.toString())
    // If the entered amount is about equal to user's total xIMO balance, then withdraw all xIMO
    if (amountBigNumber.minus(userxIMOBalanceBN).isLessThan(oneBigNumber)) {
      amountBN = userxIMOBalanceBN
    }

    const args = [amountBN]

    try {
      await txManager.executeTx('Withdraw', withdrawxIMO, ...args)
    } catch (ex) {
      console.log(ex)
      onTradeComplete(false, 'IMO', TRANSACTION_TYPES.NONE, 'no-market')
      return
    }

    setBalanceToggle(!balanceToggle)
    onTradeComplete(true, 'xIMO', TRANSACTION_TYPES.UNSTAKE, 'no-market')
  }

  const onInputChanged = (event) => {
    const oldValue = inputAmount
    const newValue = event.target.value
    const setValue = /^\d*\.?\d*$/.test(newValue) ? newValue : oldValue

    setInputAmount(setValue)
  }

  return (
    <div className="w-11/12 flex flex-col md:flex-row justify-center space-x-4 mt-8 mx-auto">
      <div className="w-full md:w-1/2">
        <span className="text-5xl text-blue-600 font-gilroy-bold">
          STAKE $IMO
        </span>

        <div className="mt-8">
          <div
            onClick={() => setShowLockInfo(!showLockInfo)}
            className="flex justify-between items-center cursor-pointer font-bold"
          >
            <span>How does it work?</span>
            {showLockInfo ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </div>

          {showLockInfo && (
            <div className="text-gray-500 text-sm mt-1">
              Staking allows you to earn more $IMO by locking up $IMO you
              already have. When you stake $IMO, you will receive xIMO (staked
              $IMO) in proportion to the amount of $IMO you staked. This
              represents your claim to the $IMO you have staked. You can stake
              and unstake $IMO at any time. If you claimed an airdrop, you
              should have some $IMO already. If you don’t have $IMO yet, you can
              buy some on Sushiswap, or earn some by Locking Listings. 3 million
              $IMO will be awarded for staking rewards over a period of 6
              months.
            </div>
          )}

          <div className="flex w-full space-x-6">
            <A href="/claim" className="w-1/2">
              <button className="py-4 mt-2 rounded-2xl w-full text-white bg-brand-blue hover:bg-blue-800">
                <p className="text-md">Elegible for the airdrop?</p>
                <p className="font-bold text-lg flex items-center text-center place-content-center">
                  <span className="mr-1">CLAMI IMO </span>
                  <IoMdExit className="w-6 h-6" />
                </p>
              </button>
            </A>
            <A href="/" className="w-1/2">
              <button className="py-4 mt-2 rounded-2xl w-full text-white bg-gray-900 hover:bg-gray-600">
                <p className="text-md">Don’t have any $IMO?</p>
                <p className="font-bold text-lg flex items-center text-center place-content-center">
                  <span className="mr-1">BUY ON UNISWAP </span>
                  <IoMdExit className="w-6 h-6" />
                </p>
              </button>
            </A>
          </div>
        </div>

        <div className="mt-8">
          <span className="text-2xl font-bold">FAQ</span>
          {accordionData.map((data) => (
            <LockingAccordion
              title={data.title}
              body={data.body}
              key={data.title}
            />
          ))}
        </div>
      </div>

      <div className="w-full md:w-1/2">
        <div className="relative w-full h-2/3 pt-10 mt-8">
          <div className="absolute top-0 left-0 bg-white/20 rounded-2xl w-full h-40 z-0"></div>

          <div className="bg-white rounded-2xl w-full h-full p-4 relative z-10">
            <div className="flex items-center font-gilroy-bold text-3xl">
              <div
                className={classNames(
                  'mr-4',
                  !isStakeSelected
                    ? 'text-gray-400 hover:text-gray-500 dark:text-gray-300 cursor-pointer'
                    : 'cursor-default'
                )}
                onClick={toggleIsStake}
              >
                Stake
              </div>

              <div
                className={classNames(
                  '',
                  isStakeSelected
                    ? 'text-gray-400 hover:text-gray-500 dark:text-gray-300 cursor-pointer'
                    : 'cursor-default'
                )}
                onClick={toggleIsStake}
              >
                Unstake
              </div>

              <div className="flex justify-end ml-auto">
                <Tooltip
                  className="w-4 h-4 cursor-pointer text-brand-gray-2 dark:text-gray-300"
                  placement="down"
                  IconComponent={CogIcon}
                  customBottomPad={-45}
                >
                  <div className="w-64">
                    <AdvancedOptions
                      disabled={txManager.isPending}
                      setIsUnlockOnceChecked={setIsUnlockOnceChecked}
                      isUnlockOnceChecked={isUnlockOnceChecked}
                      isUnlockPermanentChecked={isUnlockPermanentChecked}
                      setIsUnlockPermanentChecked={setIsUnlockPermanentChecked}
                      unlockText={''}
                    />
                  </div>
                </Tooltip>
              </div>
            </div>

            <div className="flex justify-between mt-4 mb-2">
              <div className="opacity-50">
                {isStakeSelected ? 'IMO' : 'xIMO'} amount
              </div>
            </div>
            <div className="relative px-5 py-4 mb-6 border border-gray-100 rounded-md bg-gray-50 dark:bg-gray-600 text-brand-new-dark">
              <div className="flex justify-between mb-2">
                <input
                  className="w-full max-w-sm text-3xl text-left placeholder-gray-500 placeholder-opacity-50 border-none outline-none dark:placeholder-gray-300 text-brand-gray-2 dark:text-white bg-gray-50 dark:bg-gray-600"
                  min="0"
                  placeholder={`0.0 ${isStakeSelected ? 'IMO' : 'xIMO'}`}
                  disabled={txManager.isPending}
                  value={inputAmount}
                  onChange={onInputChanged}
                />
              </div>
              <div className="flex justify-between text-sm">
                <div className="text-gray-500 dark:text-white">
                  You have:{' '}
                  {(isStakeSelected && isUserIMOBalanceLoading) ||
                  (!isStakeSelected && isUserxIMOBalanceLoading)
                    ? '...'
                    : parseFloat(
                        isStakeSelected ? userIMOBalance : userxIMOBalance
                      )}
                  {!txManager.isPending && (
                    <span
                      className="cursor-pointer text-brand-blue dark:text-blue-400"
                      onClick={maxClicked}
                    >
                      {' '}
                      (Max)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {!isStakeSelected && (
              <div>
                Payout:{' '}
                {formatNumberWithCommasAsThousandsSerperator(
                  parseFloat(imoPayoutAmount).toFixed()
                )}{' '}
                IMO
              </div>
            )}

            <div className="pb-4 pt-2">
              {account ? (
                <div>
                  <button className="flex items-center px-4 py-2 mt-4 text-blue-700 rounded-lg dark:text-blue-400 md:mt-0 m-auto">
                    <div className="relative w-6 h-4">
                      <Image
                        src="/logo.png"
                        alt="Workflow logo"
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                    1 xIMO ={' '}
                    {parseFloat(xIMOTotalSupply) <= 0 ? 0 : ratioImoAmount} IMO
                  </button>

                  <div className="flex justify-between">
                    {isInputAmountGTSupply ? (
                      <div className="text-brand-red mb-2">
                        Insufficient balance
                      </div>
                    ) : (
                      <div></div>
                    )}
                  </div>
                  <ApproveButton
                    tokenAddress={
                      isStakeSelected ? imoAddress : imoStakingAddress
                    }
                    tokenName={isStakeSelected ? 'IMO' : 'xIMO'}
                    spenderAddress={imoStakingAddress}
                    requiredAllowance={floatToWeb3BN(
                      inputAmount,
                      18,
                      BigNumber.ROUND_UP
                    )}
                    unlockPermanent={isUnlockPermanentChecked}
                    txManager={txManager}
                    setIsMissingAllowance={setIsMissingAllowance}
                    disable={isApproveButtonDisabled}
                    txType={isStakeSelected ? 'stake' : 'unstake'}
                    key={+balanceToggle} // This resets validity of this button, Get issues without it
                  />
                  <button
                    onClick={
                      isStakeSelected ? stakeIMOClicked : withdrawxIMOClicked
                    }
                    disabled={isActionButtonDisabled}
                    className={classNames(
                      'flex justify-center items-center mt-2 py-4 px-4 text-lg font-bold rounded-2xl w-full font-sf-compact-medium text-center dark:border-gray-500',
                      isActionButtonDisabled
                        ? 'text-brand-gray-2 dark:text-gray-300 bg-brand-gray dark:bg-gray-500 cursor-default border-brand-gray'
                        : 'border-brand-blue text-white bg-brand-blue font-medium hover:bg-blue-800 cursor-pointer'
                    )}
                  >
                    {isStakeSelected ? 'Stake' : 'Withdraw'}
                  </button>

                  <div className="justify-between mt-8 hidden md:flex max-w-88 m-auto">
                    <StakePriceItem
                      title="Balance"
                      tokenName="xIMO"
                      price={userxIMOBalance}
                    />
                    <StakePriceItem
                      title="Unstaked"
                      tokenName="IMO"
                      price={userIMOBalance}
                      className="ml-4"
                    />
                  </div>
                  <div
                    className={classNames(
                      'w-full grid grid-cols-3 my-5 text-sm text-brand-new-dark font-semibold',
                      txManager.isPending ? '' : 'hidden'
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
                        href={NETWORK.getEtherscanTxUrl(txManager.hash)}
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
                </div>
              ) : (
                <button
                  onClick={() => {
                    ModalService.open(WalletModal)
                  }}
                  className="w-full py-2 text-white border-2 rounded-lg border-brand-blue bg-brand-blue"
                >
                  Connect wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StakeIMO
