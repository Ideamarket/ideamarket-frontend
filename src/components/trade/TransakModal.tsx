import { Modal } from 'components'
import { NETWORK } from 'store/networks'

export default function TransakModal({ close }: { close: () => void }) {
  const isProduction =
    NETWORK.getNetworkName() === 'avm' || NETWORK.getNetworkName() === 'mainnet'
  const embedURL = isProduction
    ? `https://global.transak.com?apiKey=270c3e77-6747-4a99-926a-ae246fc8f36f&defaultNetwork=arbitrum`
    : `https://staging-global.transak.com?apiKey=7354996a-8a73-42e0-b87e-9340e23dbe9c&defaultNetwork=arbitrum`

  return (
    <Modal close={close}>
      <div className="w-full md:w-136 mx-auto bg-white dark:bg-gray-700 rounded-xl">
        <iframe
          height="625"
          title="Transak On/Off Ramp Widget"
          src={embedURL}
          frameBorder="no"
          allowFullScreen={true}
          style={{ display: 'block', width: '100%', maxHeight: '100%' }}
        />
      </div>
    </Modal>
  )
}
