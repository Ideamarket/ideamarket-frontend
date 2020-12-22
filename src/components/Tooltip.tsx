import { ReactNode, useEffect, useState, useRef } from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import Info from '../assets/info.svg'

export default function Tooltip({
  icon,
  children,
  width,
  className,
}: {
  icon?: ReactNode
  children?: ReactNode
  width?: number
  className?: string
}) {
  const ref = useRef(null)

  const [toolTipProperties, setToolTipProperties] = useState({
    tooltipWidth: width || 230,
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
    const toolTipHalfWidth = toolTipProperties.tooltipWidth / 2
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
      tooltipBottom: h - rect.y,
      tooltipLeft: tooltipLeft,
    })
    setShowToolTip(true)
  }
  return (
    <div
      className={'ml-3 inline-block ' + (className || '')}
      onMouseEnter={handleShowToolTip}
      onMouseLeave={() => setShowToolTip(false)}
    >
      {ReactDOM.createPortal(
        <div
          className={classNames(
            'fixed bg-gray-300 p-3 mb-1 rounded-lg z-50 text-sm',
            showToolTip ? 'visible' : 'invisible'
          )}
          style={{
            bottom: toolTipProperties.tooltipBottom,
            width: toolTipProperties.tooltipWidth,
            left: toolTipProperties.tooltipLeft,
          }}
        >
          {children}
        </div>,
        document.body
      )}
      {icon || (
        <div className="w-5 h-5" ref={ref}>
          <Info
            className="w-5 h-5 cursor-pointer text-brand-gray-4"
            onClick={handleShowToolTip}
          />
        </div>
      )}
    </div>
  )
}
