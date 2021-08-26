import { MutableRefObject, ReactNode } from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'

export default function TooltipContent({
  contentRef,
  show,
  children,
  bottom,
  left,
}: {
  contentRef: MutableRefObject<any>
  show: boolean
  children: ReactNode
  bottom: number
  left: number
}) {
  return ReactDOM.createPortal(
    <div
      ref={contentRef}
      className={classNames('fixed z-50 pb-5', show ? 'visible' : 'invisible')}
      style={{
        bottom: bottom,
        left: left,
      }}
    >
      <div className="p-3 mb-1 text-sm bg-gray-300 rounded-lg dark:bg-gray-800">
        {children}
      </div>
    </div>,
    document.body
  )
}
