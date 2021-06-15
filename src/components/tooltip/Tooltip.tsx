import { ReactNode, useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import classNames from 'classnames'
import Info from '../../assets/info.svg'
import { QuestionMarkCircleIcon } from '@heroicons/react/solid'

const NoSSRTooltipContent = dynamic(() => import('./TooltipContent'), {
  ssr: false,
})

export default function Tooltip({
  children,
  className,
  IconComponent = Info,
  placement,
}: {
  children?: ReactNode
  className?: string
  IconComponent?: React.FC<{ className: string; onClick: () => void }>
  placement?: string
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

    if (placement === 'down' && h < 600) {
      setToolTipProperties({
        ...toolTipProperties,
        tooltipBottom: h - rect.y - rect.height - 160,
        tooltipLeft: tooltipLeft,
      })
    } else {
      setToolTipProperties({
        ...toolTipProperties,
        tooltipBottom: h - rect.y - rect.height,
        tooltipLeft: tooltipLeft,
      })
    }

    setShowToolTip(true)
  }
  return (
    <div
      className={classNames('inline-block', className)}
      onMouseEnter={handleShowToolTip}
      onMouseLeave={() => setShowToolTip(false)}
    >
      <NoSSRTooltipContent
        contentRef={contentRef}
        show={showToolTip}
        bottom={toolTipProperties.tooltipBottom}
        left={toolTipProperties.tooltipLeft}
      >
        {children}
      </NoSSRTooltipContent>
      <div className="w-4 h-4" ref={ref}>
        <QuestionMarkCircleIcon
          className="w-4 h-4 cursor-pointer text-brand-gray-4 dark:text-gray-200"
          onClick={handleShowToolTip}
        />
      </div>
    </div>
  )
}
