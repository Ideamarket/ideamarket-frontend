import { A, CircleSpinner, Footer, Tooltip, WalletModal } from 'components'
import Image from 'next/image'
import { useState } from 'react'
import classNames from 'classnames'
import StakePriceItem from './StakePriceItem'
import { useWeb3React } from '@web3-react/core'
import ModalService from 'components/modals/ModalService'
import { useBalance, useTotalSupply } from 'actions'
import { NETWORK } from 'store/networks'
import ApproveButton from 'components/trade/ApproveButton'
import {
  floatToWeb3BN,
  formatNumberWithCommasAsThousandsSerperator,
  useTransactionManager,
} from 'utils'
import BigNumber from 'bignumber.js'
import AdvancedOptions from 'components/trade/AdvancedOptions'
import { CogIcon } from '@heroicons/react/outline'
import TradeCompleteModal, {
  TRANSACTION_TYPES,
} from 'components/trade/TradeCompleteModal'
import stakeIMO from 'actions/stakeIMO'
import withdrawxIMO from 'actions/withdrawxIMO'
import useIMOPayoutAmount from 'actions/useIMOPayoutAmount'
import useStakingAPR from 'actions/useStakingAPR'

const imoAddress = NETWORK.getDeployedAddresses().imo
const imoStakingAddress = NETWORK.getDeployedAddresses().imoStaking
const dripIMOSourceAddress =
  NETWORK.getDeployedAddresses().drippingIMOSourceContract

const StakeInner = () => {
  const txManager = useTransactionManager()
  const [isStakeSelected, setIsStakeSelected] = useState(true)
  const [isUnlockOnceChecked, setIsUnlockOnceChecked] = useState(true)
  const [isUnlockPermanentChecked, setIsUnlockPermanentChecked] =
    useState(false)
  const [isMissingAllowance, setIsMissingAllowance] = useState(false)
  const [inputAmount, setInputAmount] = useState('')
  const { account } = useWeb3React()

  const toggleIsStake = () => setIsStakeSelected(!isStakeSelected)

  const [balanceToggle, setBalanceToggle] = useState(false) // Need toggle to reload balance after stake/unstake
  const [userIMOBalance] = useBalance(imoAddress, account, 18, balanceToggle)
  const [userxIMOBalance] = useBalance(
    imoStakingAddress,
    account,
    18,
    balanceToggle
  )
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
  const [ratioImoAmount, ratioImoAmountBN] = useIMOPayoutAmount(
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

  const isInputAmountGTSupply =
    parseFloat(inputAmount) >
    parseFloat(isStakeSelected ? userIMOBalance : userxIMOBalance)

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
    const amountBN = floatToWeb3BN(inputAmount, 18, BigNumber.ROUND_DOWN)
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
    <div className="w-11/12 max-w-5xl mx-auto my-0 md:pt-24 font-inter w-90">
      <div className="flex flex-col items-end mx-4">
        <div className="invisible mb-4 text-4xl italic text-white md:visible">
          Stake
        </div>
        <div className="flex justify-between w-full mb-2 md:justify-end"></div>
      </div>
      <div className="flex flex-col items-start justify-center p-8 bg-white rounded-lg md:p-16 md:pb-32 md:flex-row dark:bg-gray-500">
        <div className="md:grid md:grid-cols-2 md:gap-8">
          <div className="mb-8 md:mb-0">
            <div className="visible mb-4 text-xl md:invisible">Stake</div>

            <div className="my-6 text-4xl font-extrabold">
              Lorem ipsum dolor sit amet, consectetur
            </div>
            <div className="text-base leading-8">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vel
              congue nibh scelerisque cursus enim.
            </div>

            <div className="justify-between mt-8 hidden md:flex max-w-88">
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
          </div>
          <div>
            <div className="bg-blue-100 dark:bg-gray-700 rounded-2xl min-h-56">
              <div className="px-6 py-6 text-xs text-white uppercase bg-no-repeat bg-cover rounded-2xl bg-claim-imo-bg">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col justify-between">
                    <div>Staking imo</div>
                    {/* <button
                      className={classNames(
                        'w-full py-2 text-white rounded-lg',
                        false
                          ? 'text-gray-500 dark:text-gray-300 bg-brand-gray dark:bg-gray-500 cursor-default border-brand-gray'
                          : 'bg-green-400 hover:bg-green-800 cursor-pointer'
                      )}
                    >
                      View stats
                    </button> */}
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold">
                      {apr
                        ? formatNumberWithCommasAsThousandsSerperator(
                            apr.toFixed(2)
                          )
                        : 0}
                      % APR
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex m-4 bg-white rounded-lg dark:bg-gray-500">
                <button
                  onClick={toggleIsStake}
                  disabled={isStakeSelected}
                  className={classNames(
                    'w-full py-2 text-white rounded-lg',
                    !isStakeSelected
                      ? 'text-gray-500 dark:text-gray-300  cursor-pointer dark:bg-gray-500'
                      : 'bg-brand-blue hover:bg-blue-800 cursor-default'
                  )}
                >
                  Stake IMO
                </button>

                <button
                  onClick={toggleIsStake}
                  disabled={!isStakeSelected}
                  className={classNames(
                    'w-full py-2 text-white rounded-lg',
                    isStakeSelected
                      ? 'text-gray-500 dark:text-gray-300  cursor-pointer  dark:bg-gray-500'
                      : 'bg-brand-blue hover:bg-blue-800 cursor-default'
                  )}
                >
                  Unstake
                </button>
              </div>
              <div className="items-center justify-between block px-4 py-4 md:flex">
                <div className="text-2xl font-extrabold leading-8">
                  {isStakeSelected ? 'Stake IMO' : 'Unstake'}
                </div>
                <button className="flex items-center px-4 py-2 mt-4 text-blue-700 border-2 border-blue-700 rounded-lg dark:text-blue-400 dark:border-blue-400 md:mt-0">
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
              </div>
              {!isStakeSelected && (
                <div className="px-4">
                  Payout:{' '}
                  {formatNumberWithCommasAsThousandsSerperator(
                    parseFloat(imoPayoutAmount).toFixed()
                  )}{' '}
                  IMO
                </div>
              )}
              <div className="px-4 pt-4 font-extrabold">
                <div className="relative">
                  <input
                    onChange={onInputChanged}
                    value={inputAmount}
                    placeholder={isStakeSelected ? '0 IMO' : '0 xIMO'}
                    className="w-full h-12 px-4 border border-gray-200 rounded-md dark:border-gray-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200"
                  />

                  <button
                    onClick={maxClicked}
                    className="absolute items-center px-2 py-1 text-sm text-blue-700 border-2 border-blue-700 rounded-lg dark:border-blue-400 dark:text-blue-400 right-2 top-2"
                  >
                    Max
                  </button>
                </div>
              </div>

              <div className="px-4 pb-4 pt-2">
                {account ? (
                  <div>
                    <div className="flex justify-between">
                      {isInputAmountGTSupply ? (
                        <div className="text-brand-red mb-2">
                          Insufficient balance
                        </div>
                      ) : (
                        <div></div>
                      )}
                      <div className="flex justify-end mb-2">
                        <Tooltip
                          className="w-4 h-4 cursor-pointer text-brand-gray-2 dark:text-gray-300"
                          placement="down"
                          IconComponent={CogIcon}
                        >
                          <div className="w-64">
                            <AdvancedOptions
                              disabled={txManager.isPending}
                              setIsUnlockOnceChecked={setIsUnlockOnceChecked}
                              isUnlockOnceChecked={isUnlockOnceChecked}
                              isUnlockPermanentChecked={
                                isUnlockPermanentChecked
                              }
                              setIsUnlockPermanentChecked={
                                setIsUnlockPermanentChecked
                              }
                              unlockText={''}
                            />
                          </div>
                        </Tooltip>
                      </div>
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
            <div className="justify-between block p-8 mt-8 border-2 rounded-lg md:hidden radius sm:flex">
              <StakePriceItem
                title="Balance"
                tokenName="xIMO"
                price={userxIMOBalance}
              />
              <StakePriceItem
                title="Unstaked"
                tokenName="IMO"
                price={userIMOBalance}
                className="mt-8 md:mt-0"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="text-brand-gray-2">
        <Footer />
      </div>
    </div>
  )
}

export default StakeInner
