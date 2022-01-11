import { Transition } from '@headlessui/react'
import classNames from 'classnames'
import { ReactNode } from 'react'
import Close from '../../assets/close.svg'

export default function Modal({
  className = '',
  children,
  close,
  isCloseActive = true, // This says: "is close button there by default?"
}: {
  className?: string
  children?: ReactNode
  close: () => void
  isCloseActive?: boolean
}) {
  return (
    <div className="absolute flex items-center justify-center text-center pt-4 pb-10">
      <span className="inline-block h-screen align-middle"></span>
      &#8203;
      <Transition
        show={true}
        enter="ease-out duration-300"
        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        enterTo="opacity-100 translate-y-0 sm:scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        className="inline-block w-full overflow-hidden text-left transition-all transform rounded-lg md:w-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        {isCloseActive && (
          <div className="flex pb-2 pr-2 md:pr-0">
            <button
              type="button"
              className="p-2 ml-auto text-white transition duration-150 ease-in-out rounded-xl w-9 h-9 bg-very-dark-blue hover:text-gray-500 focus:outline-none focus:text-gray-500"
              aria-label="Close"
              onClick={close}
            >
              <Close className="w-full h-full" />
            </button>
          </div>
        )}
        <div
          className={classNames(
            className,
            'bg-white dark:bg-gray-700 rounded-lg overflow-hidden'
          )}
        >
          {children}
        </div>
      </Transition>
    </div>
  )
}
