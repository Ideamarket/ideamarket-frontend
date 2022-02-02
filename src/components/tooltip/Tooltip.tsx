import { ReactNode, useEffect, useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import classNames from 'classnames'
import { QuestionMarkCircleIcon } from '@heroicons/react/solid'

const HIDING_DELAY_TIME = 200 // delay time to hide tooltip after mouse leave

const NoSSRTooltipContent = dynamic(() => import('./TooltipContent'), {
  ssr: false,
})

export default function Tooltip({
  children,
  className,
  IconComponent = QuestionMarkCircleIcon,
  placement,
  iconComponentClassNames,
  tooltipContentclassName,
  customBottomPad,
}: {
  children?: ReactNode
  className?: string
  IconComponent?: React.FC<{ className: string; onClick: () => void }>
  placement?: string
  iconComponentClassNames?: string
  tooltipContentclassName?: string
  customBottomPad?: number
}) {
  const ref = useRef(null)
  const contentRef = useRef(null)
  const [hiderTimerId, setHideTimerId] = useState(null)

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
    hiderTimerId && clearTimeout(hiderTimerId)
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

    if (placement === 'down') {
      setToolTipProperties({
        ...toolTipProperties,
        tooltipBottom: h - rect.y - rect.height - 145 - customBottomPad,
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
  const onMouseLeave = useCallback(() => {
    const hideTimeoutId = setTimeout(() => {
      setShowToolTip(false)
    }, HIDING_DELAY_TIME)
    setHideTimerId(hideTimeoutId)
  }, [])
  return (
    <div
      className={classNames('inline-block', className)}
      onMouseEnter={handleShowToolTip}
      onMouseLeave={onMouseLeave}
    >
      <NoSSRTooltipContent
        contentRef={contentRef}
        show={showToolTip}
        bottom={toolTipProperties.tooltipBottom}
        left={toolTipProperties.tooltipLeft}
        className={tooltipContentclassName}
      >
        {children}
      </NoSSRTooltipContent>
      <div
        className={classNames(
          iconComponentClassNames ? iconComponentClassNames : 'w-4 h-4'
        )}
        ref={ref}
      >
        <IconComponent
          className="w-4 h-4 cursor-pointer"
          onClick={handleShowToolTip}
        />
      </div>
    </div>
  )
}
