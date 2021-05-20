import classNames from 'classnames'
import { useRef, useState, useContext } from 'react'
import toast from 'react-hot-toast'
import { GlobalContext } from 'pages/_app'

export default function EmailForm() {
  const [email, setEmail] = useState('')
  const [isError, setIsError] = useState(false)
  const toastId = useRef('')
  const { setIsEmailHeaderActive } = useContext(GlobalContext)

  return (
    <>
      <form
        className="px-2 md:rounded-tr-lg"
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
            setIsEmailHeaderActive(false)
            localStorage.setItem('IS_EMAIL_BAR_CLOSED', 'true')
            toast.success('Successfully added you to our list!', {
              id: toastId.current,
            })
          })
        }}
      >
        {/* Moble START */}
        <div className="md:hidden">
          <div>
            <input
              type="email"
              name="email"
              id="mobile-email"
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

          <div className="flex items-center justify-between mt-2">
            <label
              htmlFor="email"
              className="flex-shrink-0 block text-sm font-medium text-gray-700"
            >
              Stay in the loop
            </label>

            <button
              type="submit"
              className="bg-white flex-shrink-0 p-2 px-3 text-xs border rounded-md text-brand-gray-4 hover:border-brand-blue hover:text-brand-blue focus:border-brand-blue"
            >
              Submit
            </button>
          </div>
        </div>
        {/* Mobile END */}

        {/* Desktop START */}
        <div className="hidden md:flex items-center space-x-2">
          <label
            htmlFor="email"
            className="flex-shrink-0 block text-sm font-medium text-gray-700"
          >
            Stay in the loop
          </label>

          <div>
            <input
              type="email"
              name="email"
              id="header-email"
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
            className="bg-white flex-shrink-0 p-2 px-3 text-xs border rounded-md text-brand-gray-4 hover:border-brand-blue hover:text-brand-blue focus:border-brand-blue"
          >
            Submit
          </button>
        </div>
        {/* Desktop END */}
      </form>
    </>
  )
}
