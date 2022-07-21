import { WalletModal } from 'components'
import ModalService from 'components/modals/ModalService'
import RateModal from 'components/trade/RateModal'
import { GlobalContext } from 'lib/GlobalContext'
import { IdeamarketPost } from 'modules/posts/services/PostService'
import Slider, { Handle } from 'rc-slider'
import { useContext } from 'react'
import { useWalletStore } from 'store/walletStore'

type Props = {
  imPost: IdeamarketPost
}

const OpenRateModal = ({ imPost }: Props) => {
  const { setOnWalletConnectedCallback } =
    useContext(GlobalContext)

  const onRateDragged = (draggedPost: any) => {
    if (!useWalletStore.getState().web3) {
      setOnWalletConnectedCallback(() => () => {
        ModalService.open(RateModal, { imPost: draggedPost })
      })
      ModalService.open(WalletModal)
    } else {
      ModalService.open(RateModal, { imPost: draggedPost })
    }
  }

  return (
    <div className="w-full flex items-center h-16 bg-white rounded-xl border">
      <Slider
        className=""
        defaultValue={50}
        onAfterChange={(value) => {
          onRateDragged(imPost)
        }}
        // marks={sliderMarks}
        step={1}
        min={0}
        max={100}
        // tipFormatter={(value) => {
        //   return `${value}`
        // }}
        handle={(handleProps: any) => {
          return (
            <Handle
              {...handleProps}
              dragging={handleProps?.dragging?.toString()}
            >
              <div className="absolute -top-1 -left-6 w-[3.5rem] h-[2rem] rounded-2xl text-white bg-blue-600 flex justify-center items-center">
                Drag
              </div>
            </Handle>
          )
        }}
        railStyle={{
          height: "20px",
          borderRadius: 0
        }}
        trackStyle={{
          height: "20px",
          borderRadius: 0
        }}
        style={{ padding: 0, left: '0px' }}
      />
    </div>
  )
}

export default OpenRateModal
