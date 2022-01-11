import { useState, useEffect, useRef } from 'react'
import ModalService from './ModalService'

export default function ModalRoot() {
  const [modalList, setModalList] = useState([] as any)
  const myStateRef = useRef(modalList) // Why useRef is needed: https://medium.com/geographit/accessing-react-state-in-event-listeners-with-usestate-and-useref-hooks-8cceee73c559

  useEffect(() => {
    ModalService.on('open', ({ component, props, onClose }) => {
      const currentModalList = myStateRef.current

      const newModalList = [
        ...currentModalList,
        {
          component,
          props,
          close: () => {
            const currentModalList = myStateRef.current
            // Removes modal at end of list
            const newModalList = [
              ...currentModalList.filter(
                (_modal, index) => index !== currentModalList.length - 1
              ),
            ]
            myStateRef.current = newModalList
            setModalList(newModalList)
            if (newModalList.length === 0) {
              document.body.style.overflow = 'auto' // Enable page scrolling again once modals are gone
            }
            onClose()
          },
        },
      ]

      myStateRef.current = newModalList

      if (newModalList.length === 1) {
        document.body.style.overflow = 'hidden' // Disable page scrolling when first modal is opened
      }

      setModalList(newModalList)
    })
  }, [])

  return (
    <section>
      {modalList &&
        modalList.map((modal, index) => {
          const ModalComponent = modal.component ? modal.component : null

          return (
            <div
              className={
                modalList?.length > 0
                  ? 'fixed flex justify-center inset-0 overflow-y-auto z-50 bg-gray-500 bg-opacity-75'
                  : ''
              }
              key={index}
            >
              <ModalComponent
                {...modal.props}
                close={modal.close}
                className={ModalComponent ? 'd-block' : ''}
              />
            </div>
          )
        })}
    </section>
  )
}
