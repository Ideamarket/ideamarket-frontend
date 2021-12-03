import React, { useState, useCallback } from 'react'
import classNames from 'classnames'

interface Props {
  title: string
  body: string
}
export const Accordion: React.FC<Props> = ({ title, body }) => {
  const [opened, setOpened] = useState<Boolean>(false)
  const toggleAccordion = useCallback(() => {
    setOpened((b) => !b)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col p-4 my-2 rounded-xl border-2 bg-gray-200 border-gray-300 w-full">
      <div
        className="flex justify-between cursor-pointer"
        onClick={toggleAccordion}
      >
        <span className="font-semibold text-sm pr-8 opacity-75">{title}</span>
        <span
          className={classNames(
            'border-black w-2 h-2',
            opened
              ? 'transform rotate-45  mt-1 border-l border-t'
              : 'transform rotate-45  mt-1.5 border-r border-b'
          )}
        ></span>
      </div>
      {opened && <div className="pl-2 pt-4 text-sm opacity-75">{body}</div>}
    </div>
  )
}
