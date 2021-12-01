import { useState, useEffect } from 'react'
import ModalService from './ModalService'

export default function ModalRoot() {
  const [modal, setModal] = useState({} as any)

  useEffect(() => {
    ModalService.on('open', ({ component, props, onClose }) => {
      setModal({
        component,
        props,
        close: () => {
          setModal({} as any)
          onClose()
        },
      })
    })
  }, [])

  const ModalComponent = modal.component ? modal.component : null

  return (
    <section
      className={
        modal.component
          ? 'fixed inset-0 overflow-y-auto z-50 bg-gray-500 bg-opacity-75'
          : ''
      }
    >
      {ModalComponent && (
        <ModalComponent
          {...modal.props}
          close={modal.close}
          className={ModalComponent ? 'd-block' : ''}
        />
      )}
    </section>
  )
}
