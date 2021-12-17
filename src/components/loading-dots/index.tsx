import React from 'react'

interface Props {
  dotClassName?: string
  dotCount?: number
}

export const LoadingDots: React.FC<Props> = ({
  dotClassName = 'bg-gray-600',
  dotCount = 3,
}) => {
  return (
    <div className="fixed bottom-10 inset-x-1/2 w-max transform -translate-x-1/2 flex items-center justify-center space-x-2 animate-pulse">
      {Array.from(Array(dotCount).keys()).map((id) => (
        <div key={id} className={`${dotClassName} w-6 h-6 rounded-full`}></div>
      ))}
    </div>
  )
}
