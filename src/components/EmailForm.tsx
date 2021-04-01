import classNames from 'classnames'
import { useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

export default function EmailForm() {
  const [email, setEmail] = useState('')
  const [isError, setIsError] = useState(false)
  const toastId = useRef('')
  return (
    <>
      <Toaster />
      <form
        className="bg-white rounded-r-lg flex items-center px-2 ml-auto space-x-2"
        onSubmit={async (e) => {
          if (!toastId.current) {
            const id = toast.loading('Adding to our list...')
            toastId.current = id
          } else {
            toast.loading('Adding to our list...', { id: toastId.current })
          }
          console.log('starting')
          e.preventDefault()
          setIsError(false)
          if (email.trim() === '') {
            return
          }
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
          className="block text-sm font-medium text-gray-700 flex-shrink-0"
        >
          Notify me of new markets:
        </label>
        <div>
          <input
            type="text"
            name="email"
            id="email"
            className={classNames(
              'h-8 shadow-sm block w-full sm:text-sm rounded-md focus:outline-none',
              isError
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
            )}
            placeholder="foo@bar.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="flex-shrink-0 p-2 border rounded-md px-3 text-xs text-brand-gray-4"
        >
          Sign up
        </button>
      </form>
    </>
  )
}
