import useReversePrice from "actions/useReversePrice"
import { useState } from "react"
import { NETWORK } from "store/networks"
import BN from 'bn.js'
import { bigNumberTenPow18, calculateIdeaTokenDaiValue, formatNumberWithCommasAsThousandsSerperator, web3BNToFloatString } from "utils"
import { IdeaMarket, IdeaToken } from "store/ideaMarketsStore"
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

const sliderMarks = {0:'0', 100:'100', 1000:'1K', 10000:'10K', 100000:'100K', 1000000:'1M', 10000000:'10M'}

type Props = {
  ideaToken: IdeaToken
  market: IdeaMarket
}

const InvestmentCalculator = ({ ideaToken, market }: Props) => {
  const [usdBuyAmount, setUsdBuyAmount] = useState('0')
  const [otherUsdBuyAmount, setOtherUsdBuyAmount] = useState('0')

  // Calculates the ideaToken amount for usdBuyAmount
  const [
    isIdeaTokenAmountLoading,
    ideaTokenAmountBN,
    ideaTokenAmount,
  ] = useReversePrice(
    ideaToken,
    market,
    NETWORK.getExternalAddresses().dai,
    usdBuyAmount,
    18,
    'buy',
  )

  // Calculates the ideaToken amount for otherUsdBuyAmount
  const [
    isOtherIdeaTokenAmountLoading,
    otherIdeaTokenAmountBN,
    otherIdeaTokenAmount,
  ] = useReversePrice(
    ideaToken,
    market,
    NETWORK.getExternalAddresses().dai,
    otherUsdBuyAmount,
    18,
    'buy',
  )

  console.log('ideaTokenAmount==', ideaTokenAmount)

  const ideaTokenValue = web3BNToFloatString(
    calculateIdeaTokenDaiValue(
      ideaTokenAmountBN ? ideaToken?.rawSupply.add(ideaTokenAmountBN) :
        new BN('0'),
      market,
      ideaTokenAmountBN
    ),
    bigNumberTenPow18,
    2
  )

  const otherIdeaTokenValue = web3BNToFloatString(
    calculateIdeaTokenDaiValue(
      ideaTokenAmountBN && otherIdeaTokenAmountBN ? ideaToken?.rawSupply.add(ideaTokenAmountBN.add(otherIdeaTokenAmountBN)) :
        new BN('0'),
      market,
      ideaTokenAmountBN
    ),
    bigNumberTenPow18,
    2
  )

  const buyProfit = +otherIdeaTokenValue - +ideaTokenValue
  const buyWorth = +usdBuyAmount + buyProfit

  const calculatePercentChange = (a: number, b: number) => 100 * ((b - a) / Math.abs(a))
  const percentChange = formatNumberWithCommasAsThousandsSerperator(parseInt(calculatePercentChange(+usdBuyAmount, buyWorth).toString()))

  return (
    <div className="px-2">
      <div className="pb-5 mb-5 border-b text-center text-xl text-gray-400 font-medium">Price Calculator</div>
      <div>
        <div>
          <span>You buy</span>
          <div>price thing goes here</div>
          <Slider marks={sliderMarks} min={0} max={10000000} />
          <input value={usdBuyAmount} onChange={(e) => setUsdBuyAmount(e.target.value)} />
        </div>
        <div>
          <span>Others buy</span>
          <div>price thing goes here</div>
          <input value={otherUsdBuyAmount} onChange={(e) => setOtherUsdBuyAmount(e.target.value)} />
        </div>
        <div>
          <p>If you buy ${formatNumberWithCommasAsThousandsSerperator(parseInt(usdBuyAmount))} worth of {ideaToken.name}, and then others buy ${formatNumberWithCommasAsThousandsSerperator(parseInt(otherUsdBuyAmount))} more,</p>
          <p>Your buy would be worth ~${formatNumberWithCommasAsThousandsSerperator(parseInt(buyWorth.toString()))}, a +{percentChange}% change.</p>
        </div>
      </div>
    </div>
  )
}

export default InvestmentCalculator
