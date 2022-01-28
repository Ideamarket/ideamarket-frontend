import Modal from '../modals/Modal'
import WalletInterfaceDropdown from './WalletInterfaceDropdown'

export default function WalletModal({ close }: { close: () => void }) {
  return (
    <Modal close={close}>
      {/* <NoSSRWalletInterface onWalletConnected={close} /> */}
      <WalletInterfaceDropdown />
    </Modal>
  )
}
