import { IdeaToken, IdeaMarket } from 'store/ideaMarketsStore'
import { Modal, TradeInterface } from 'components'
import ModalService from 'components/modals/ModalService'
import TradeCompleteModal, { TRANSACTION_TYPES } from './TradeCompleteModal'

export default function TradeModal({
  close,
  ideaToken,
  market,
  parentComponent,
}: {
  close: () => void
  ideaToken: IdeaToken
  market: IdeaMarket
  parentComponent?: string
}) {
  function onTradeComplete(
    isSuccess: boolean,
    tokenName: string,
    transactionType: TRANSACTION_TYPES
  ) {
    close()
    ModalService.open(TradeCompleteModal, {
      isSuccess,
      tokenName,
      marketName: market.name,
      transactionType,
    })
  }

  return (
    <Modal close={close}>
      <div className="pt-2">
        <TradeInterface
          ideaToken={ideaToken}
          market={market}
          onTradeComplete={onTradeComplete}
          onValuesChanged={() => {}}
          resetOn={true}
          centerTypeSelection={true}
          showTypeSelection={true}
          showTradeButton={true}
          disabled={false}
          parentComponent={parentComponent || 'TradeModal'}
        />
      </div>
    </Modal>
  )
}
