import Modal from '../modals/Modal'
import { AccountOptionsInterface } from './AccountOptionsInterface'

export default function AccountOptionsModal({
  close,
  onLoginClicked,
}: {
  close: () => void
  onLoginClicked: () => void
}) {
  return (
    <Modal close={close}>
      <AccountOptionsInterface onLoginClicked={onLoginClicked} />
    </Modal>
  )
}
