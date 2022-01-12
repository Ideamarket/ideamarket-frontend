import React, { useState, useCallback } from 'react'
import classNames from 'classnames'

interface Props {
  title: string
  body: string
}

export const LockingAccordion: React.FC<Props> = ({ title, body }) => {
  const [opened, setOpened] = useState<Boolean>(false)

  return (
    <div className="flex flex-col py-4 my-2 border-b bg-white/5 border-gray-300 w-full">
      <div
        className="flex justify-between cursor-pointer"
        onClick={() => setOpened((b) => !b)}
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
      {opened && (
        <div className="pt-4 text-sm opacity-75 whitespace-pre-line">
          {body}
        </div>
      )}
    </div>
  )
}
