import classNames from 'classnames'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'

export default function EmailForm() {
  const [email, setEmail] = useState('')
  const [isError, setIsError] = useState(false)
  const toastId = useRef('')
  return (
    <>
      <form
        className="flex flex-col items-center px-2 pb-2 space-x-2 space-y-2 bg-white md:pb-0 md:rounded-tr-lg md:flex-row md:space-y-0 md:ml-auto"
        onSubmit={async (e) => {
          e.preventDefault()
          if (email.trim() === '') {
            return
          }
          if (!toastId.current) {
            const id = toast.loading('Adding to our list...')
            toastId.current = id
          } else {
            toast.loading('Adding to our list...', { id: toastId.current })
          }
          setIsError(false)
          fetch(`/api/airtable-send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email.trim(),
            }),
          }).then((res) => {
            if (!res.ok) {
              toast.error('Something went wrong!! Please try again.', {
                id: toastId.current,
              })
              setIsError(true)
              return
            }
            setEmail('')
            toast.success('Successfully added you to our list!', {
              id: toastId.current,
            })
          })
        }}
      >
        <label
          htmlFor="email"
          className="flex-shrink-0 block text-sm font-medium text-gray-700"
        >
          Notify me of new markets:
        </label>
        <div>
          <input
            type="email"
            name="email"
            id="email"
            className={classNames(
              'h-8 shadow-sm block w-full sm:text-sm rounded-md focus:outline-none',
              isError
                ? 'border-red-300 text-brand-red placeholder-red-300 focus:ring-red-500 focus:border-brand-red'
                : 'border-gray-300 focus:ring-brand-blue focus:border-brand-blue'
            )}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="flex-shrink-0 p-2 px-3 text-xs border rounded-md text-brand-gray-4 hover:border-brand-blue hover:text-brand-blue focus:border-brand-blue"
        >
          Sign up
        </button>
      </form>
    </>
  )
}
