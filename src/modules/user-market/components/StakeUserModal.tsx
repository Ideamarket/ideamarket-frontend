import { IdeaMarket, IdeaToken } from 'store/ideaMarketsStore'
import { Modal } from 'components'
import ModalService from 'components/modals/ModalService'
import TradeCompleteModal, {
  TX_TYPES,
} from 'components/trade/TradeCompleteModal'
import StakeUserUI from './StakeUserUI'

export default function TradeModal({
  close,
  ideaToken,
  market,
  startingTradeType = TX_TYPES.BUY,
}: {
  close: () => void
  ideaToken: IdeaToken
  market: IdeaMarket
  startingTradeType: TX_TYPES
}) {
  function onTradeComplete(
    isSuccess: boolean,
    listingId: string,
    idtValue: string,
    transactionType: TX_TYPES
  ) {
    close()
    ModalService.open(TradeCompleteModal, {
      isSuccess,
      listingId,
      idtValue,
      transactionType,
    })
  }

  return (
    <Modal close={close}>
      <StakeUserUI
        ideaToken={ideaToken}
        market={market}
        onTradeComplete={onTradeComplete}
        onValuesChanged={() => {}}
        resetOn={true}
        centerTypeSelection={true}
        showTypeSelection={true}
        showTradeButton={true}
        disabled={false}
        startingTradeType={startingTradeType}
      />
    </Modal>
  )
}
