import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import { useContractStore } from 'store/contractStore'
import { L1_NETWORK } from 'store/networks'
import { zeroBigNumber, zeroBN } from 'utils'
import Web3 from 'web3'

/**
 * @returns the IMO that is pending to be dripped to the staking contract
 */
export const getPendingIMO = async (
  dripSourceIMOBalanceBN: BN
): Promise<BN> => {
  const web3 = new Web3(L1_NETWORK.getRPCURL())
  const drippingIMOSource =
    useContractStore.getState().drippingIMOSourceContract
  const dripSourceIMOBalanceBigNumber = new BigNumber(
    dripSourceIMOBalanceBN.toString()
  )
  const currentBlockBigNumber = new BigNumber(
    (await web3.eth.getBlockNumber()).toString()
  ) // Current Ethereum block
  const lastBlockBigNumber = new BigNumber(
    (await drippingIMOSource.methods._lastBlock().call()).toString()
  )
  const rateBigNumber = new BigNumber(
    (await drippingIMOSource.methods._rate().call()).toString()
  )

  const numBlocksBigNumber = currentBlockBigNumber.minus(lastBlockBigNumber)
  const payoutBigNumber = numBlocksBigNumber.multipliedBy(rateBigNumber)

  // Return 0 if payouts are disabled or drip contract has paid out all funds
  if (
    rateBigNumber.isEqualTo(zeroBigNumber) ||
    dripSourceIMOBalanceBigNumber.eq(zeroBigNumber)
  )
    return zeroBN

  // Return payout or remaining funds if drip contract has almost paid out all funds
  return new BN(
    dripSourceIMOBalanceBigNumber.isLessThan(payoutBigNumber)
      ? dripSourceIMOBalanceBigNumber.toFixed()
      : payoutBigNumber.toFixed()
  )
}
