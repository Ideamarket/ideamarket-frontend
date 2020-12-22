import { ReactNode, useEffect, useState } from 'react'
import classNames from 'classnames'
import Info from '../assets/info.svg'

export default function Tooltip({
  icon,
  text,
  width,
  className,
}: {
  icon?: ReactNode
  text?: ReactNode
  width?: number
  className?: string
}) {
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
  const handleShowToolTip = (event) => {
    var w = window.innerWidth
    var h = window.innerHeight
    const toolTipHalfWidth = toolTipProperties.tooltipWidth / 2
    let tooltipLeft = event.clientX - toolTipHalfWidth
    // If tooltip is crossing window width
    if (w < event.clientX + toolTipHalfWidth) {
      tooltipLeft = tooltipLeft - (event.clientX + toolTipHalfWidth - w) - 25
    }
    // If tooltip is crossing left window
    if (tooltipLeft < 0) {
      tooltipLeft = tooltipLeft - tooltipLeft + 25
    }
    setToolTipProperties({
      ...toolTipProperties,
      tooltipBottom: h - event.clientY + 15,
      tooltipLeft: tooltipLeft,
    })
    setShowToolTip(true)
  }
  return (
    <div
      className={'relative ml-3 inline-block ' + (className || '')}
      onMouseEnter={handleShowToolTip}
      onMouseLeave={() => setShowToolTip(false)}
    >
      <div
        className={classNames(
          'fixed border-solid bg-gray-300 p-2 mb-1 rounded-t-m z-50',
          showToolTip ? 'visible' : 'invisible'
        )}
        style={{
          bottom: toolTipProperties.tooltipBottom,
          width: toolTipProperties.tooltipWidth,
          left: toolTipProperties.tooltipLeft,
        }}
      >
        {text}
      </div>
      {icon || (
        <Info
          className="w-5 h-5 cursor-pointer text-brand-gray-4"
          onClick={handleShowToolTip}
        />
      )}
    </div>
  )
}
