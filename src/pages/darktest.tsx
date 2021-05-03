import { useTheme } from 'next-themes'

export default function Darktest() {
  const { theme, setTheme } = useTheme()

  return (
    <>
      <nav className="border-b dark:border-gray-500 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto flex items-center h-20 w-full justify-between px-4">
          <div className="flex items-center">
            <button className="hidden lg:block px-4 dark:text-black">
              OPTION 1
            </button>
            <button className="hidden lg:block px-4 dark:text-white">
              OPTION 2
            </button>
            <button className="hidden lg:block px-4 dark:text-white">
              OPTION 3
            </button>
            <button className="px-4 dark:text-white">LOG IN</button>
            <button className="bg-green-500 text-white rounded shadow-md px-4 py-1">
              Sign Up
            </button>
            <button
              id="switchTheme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-10 w-10 flex justify-center items-center focus:outline-none text-yellow-500"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </nav>
      <main className="bg-gray-800 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-24 grid grid-cols-2">
          <div>
            <h1 className="py-4 text-blue-500 font-bold text-6xl dark:text-gray-200">
              Credibility without media corporations <br />
            </h1>
            <p className="text-2xl text-white py-4 dark:text-pink-200">
              Vote with dollars to give underrated voices the attention they
              deserve.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
