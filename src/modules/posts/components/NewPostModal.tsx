import { Modal } from 'components'
import TradeCompleteModal, {
  TX_TYPES,
} from 'components/trade/TradeCompleteModal'
import ModalService from 'components/modals/ModalService'
import NewPostUI from './NewPostUI'

export default function NewPostModal({
  close,
  onStakeClicked,
}: {
  close: () => void
  onStakeClicked?: () => void
}) {
  function onTradeComplete(
    isSuccess: boolean,
    listingId: string,
    idtValue: string,
    txType: TX_TYPES
  ) {
    close()
    ModalService.open(TradeCompleteModal, {
      isSuccess,
      listingId,
      idtValue,
      txType,
      onStakeClicked, // Putting this inside TradeCompleteModal causes memory issue, so have to pass as prop
    })
  }

  return (
    <Modal close={close}>
      <div className="w-full md:w-136 mx-auto bg-white dark:bg-gray-700 rounded-xl">
        <NewPostUI onTradeComplete={onTradeComplete} />
      </div>
    </Modal>
  )
}
