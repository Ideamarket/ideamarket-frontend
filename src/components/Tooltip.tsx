import { ReactNode, useEffect, useState, useRef } from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import Info from '../assets/info.svg'

export default function Tooltip({
  children,
  className,
}: {
  children?: ReactNode
  className?: string
}) {
  const ref = useRef(null)
  const contentRef = useRef(null)

  const [toolTipProperties, setToolTipProperties] = useState({
    tooltipBottom: 0,
    tooltipLeft: 0,
  })

  const [showToolTip, setShowToolTip] = useState(false)
  useEffect(() => {
    window.onscroll = () => {
      setShowToolTip(false)
    }
  }, [])

  const handleShowToolTip = () => {
    const rect = ref.current.getBoundingClientRect()

    const w = window.innerWidth
    const h = window.innerHeight
    const toolTipHalfWidth =
      contentRef.current.getBoundingClientRect().width / 2
    let tooltipLeft = rect.x - toolTipHalfWidth
    // If tooltip is crossing window width
    if (w < rect.x + toolTipHalfWidth) {
      tooltipLeft = tooltipLeft - (rect.x + toolTipHalfWidth - w) - 25
    }
    // If tooltip is crossing left window
    if (tooltipLeft < 0) {
      tooltipLeft = tooltipLeft - tooltipLeft + 25
    }
    setToolTipProperties({
      ...toolTipProperties,
      tooltipBottom: h - rect.y - rect.height,
      tooltipLeft: tooltipLeft,
    })
    setShowToolTip(true)
  }
  return (
    <div
      className={classNames('inline-block', className)}
      onMouseEnter={handleShowToolTip}
      onMouseLeave={() => setShowToolTip(false)}
    >
      {process.browser ? (
        ReactDOM.createPortal(
          <div
            ref={contentRef}
            className={classNames(
              'fixed z-50 pb-5',
              showToolTip ? 'visible' : 'invisible'
            )}
            style={{
              bottom: toolTipProperties.tooltipBottom,
              left: toolTipProperties.tooltipLeft,
            }}
          >
            <div className="p-3 mb-1 text-sm bg-gray-300 rounded-lg">
              {children}
            </div>
          </div>,
          document.body
        )
      ) : (
        <div></div>
      )}

      <div className="w-5 h-5" ref={ref}>
        <Info
          className="w-5 h-5 cursor-pointer text-brand-gray-4"
          onClick={handleShowToolTip}
        />
      </div>
    </div>
  )
}
