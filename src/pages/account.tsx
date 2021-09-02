import { Footer } from 'components'
import { useState } from 'react'
import A from 'components/A'
import Image from 'next/image'

const defaultVisibilityOptions = [
  { value: 'email', label: 'Email Address', isVisible: true, },
  { value: 'addresses', label: 'ETH Addresses', isVisible: true, },
  { value: 'bio', label: 'Bio', isVisible: true, },
  { value: 'holdings', label: 'Holdings', isVisible: true, }
]

const Account = () => {
  const [visibilityOptions, setVisibilityOptions] = useState(defaultVisibilityOptions)

  return (
    <>
      <div className="hidden md:flex flex-col justify-center items-center w-screen bg-blue-600 font-inter">
        <div className="w-3/4 flex flex-col items-end mb-2">
          <div className="text-4xl text-white italic mb-4">My Account</div>
          <div>
            <A className="mr-12">Settings</A>
            <A className="">Profile</A>
          </div>
        </div>
        <div className="relative flex items-start justify-center w-4/5 h-3/5 px-6 py-5 bg-white rounded-lg">
          <div className="absolute -top-16 left-10 w-36 h-36 rounded-full">
            <Image
              src={'/gray.svg'}
              alt="token"
              layout="fill"
              objectFit="contain"
              className="rounded-full"
            />
          </div>
          <div className="w-1/4 mr-8 mt-16 flex flex-col text-center">
            <div className="border-b border-gray-100 p-3">
              <div className="text-blue-400 text-xs">USERNAME</div>
              <div className="text-3xl font-semibold">Balajis</div>
            </div>
            <div className="border-b border-gray-100 p-3">
              <div className="text-blue-400 text-xs">EMAIL ADDRESS</div>
              <div>balajis@ex.com</div>
            </div>
            <div className="border-b border-gray-100 p-3">
              <div className="text-blue-400 text-xs">ETH ADDRESS</div>
              <div>0xw325ffs345fdw24...</div>
            </div>
            <div>
              <div className="text-blue-400 text-xs p-3">BIO</div>
              <div className="leading-5">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Id nunc quam nunc non ultrices morbi mi odio scelerisque. Eget fermentum id viverra vulputate nunc mi quis accumsan imperdiet. Placerat iaculis in eget egestas donec fermentum ut egestas...</div>
            </div>
            <button
              onClick={() => {}}
              className="m-3 py-2 text-white rounded-lg bg-brand-blue hover:bg-blue-800"
            >Save Profile</button>
          </div>
          <div className="w-3/4 h-full">
            <div className="text-3xl font-semibold p-3 border-b border-gray-100">Settings</div>
            <div className="flex space-x-2">
              <div className="w-full">
                <div className="font-bold p-3">Account Information</div>
                <div className="bg-gray-100 flex flex-col w-full h-full space-y-2 px-3 py-2 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Email Address</span>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="h-8 w-52 shadow-sm block sm:text-sm rounded-md focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 border-gray-300 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>Password</span>
                    <div className="space-y-2">
                      <input
                        type="password"
                        name="currentPassword"
                        id="currentPassword"
                        className="h-8 w-52 p-3 shadow-sm block sm:text-sm rounded-md focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 border-gray-300 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
                        placeholder="Current Password"
                      />
                      <input
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        className="h-8 w-52 p-3 shadow-sm block sm:text-sm rounded-md focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 border-gray-300 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
                        placeholder="New Password"
                      />
                      <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        className="h-8 w-52 p-3 shadow-sm block sm:text-sm rounded-md focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 border-gray-300 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
                        placeholder="Confirm Password"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Bio</span>
                    <textarea
                      className="w-52 rounded-md border-gray-300 dark:border-gray-500"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full">
                <div className="font-bold p-3">Visibility Options</div>
                <div className="bg-gray-100 flex flex-col space-y-6 w-full px-3 py-2 rounded-lg">
                  {visibilityOptions.map(option => {
                    return (
                      <div className="flex justify-between items-center" key={option.value}>
                        <span>{option.label}</span>
                        <input
                          type="checkbox"
                          id={`checkbox-${option.value}`}
                          className="cursor-pointer rounded-lg"
                          checked={option.isVisible}
                          onChange={(e) => {

                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-3/4 mt-16 text-white">
          <Footer />
        </div>
      </div>

      <div className="flex md:hidden flex-col justify-start items-center w-screen py-24 bg-blue-600 font-inter">
        <div className="w-5/6 px-2 flex justify-between text-white">
          <A className="">Settings</A>
          <A className="ml-auto">Profile</A>
        </div>
        <div className="relative flex flex-col items-center justify-center w-5/6 px-6 pb-5 pt-20 bg-white rounded-lg text-center">
          <div className="absolute -top-16 w-36 h-36 rounded-full">
            <Image
              src={'/gray.svg'}
              alt="token"
              layout="fill"
              objectFit="contain"
              className="rounded-full"
            />
          </div>
          <div className="w-full border-b border-gray-100 py-3">
            <div className="text-blue-400 text-xs">USERNAME</div>
            <div className="text-3xl font-semibold">Balajis</div>
          </div>
          <div className="w-full border-b border-gray-100 py-3">
            <div className="text-blue-400 text-xs">BIO</div>
            <div className="text-lg leading-5">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Id nunc quam nunc non ultrices morbi mi odio scelerisque. Eget fermentum id viverra vulputate nunc mi quis accumsan imperdiet. Placerat iaculis in eget egestas donec fermentum ut egestas...</div>
          </div>
          <div className="w-full border-b border-gray-100 py-3">
            <div className="text-blue-400 text-xs">EMAIL ADDRESS</div>
            <div className="text-lg">balajis@ex.com</div>
          </div>
          <div className="w-full border-b border-gray-100 py-3">
            <div className="text-blue-400 text-xs">ETH ADDRESS</div>
            <div className="text-lg">0xw325ffs345fdw24...</div>
          </div>

          <div className="w-full">
            <div className="font-bold p-3">Account Information</div>
            <div className="bg-gray-100 flex flex-col w-full h-full space-y-2 px-3 py-2 rounded-lg">
              <div className="flex flex-col justify-between items-start space-y-2">
                <span>Email Address</span>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="h-8 w-full shadow-sm block sm:text-sm rounded-md focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 border-gray-300 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
                  placeholder="you@example.com"
                />
              </div>
              <div className="flex flex-col justify-between items-start space-y-2">
                <span>Password</span>
                <div className="space-y-2">
                  <input
                    type="password"
                    name="currentPassword"
                    id="currentPassword"
                    className="h-8 w-full p-3 shadow-sm block sm:text-sm rounded-md focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 border-gray-300 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
                    placeholder="Current Password"
                  />
                  <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    className="h-8 w-full p-3 shadow-sm block sm:text-sm rounded-md focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 border-gray-300 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
                    placeholder="New Password"
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    className="h-8 w-full p-3 shadow-sm block sm:text-sm rounded-md focus:outline-none dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200 border-gray-300 dark:border-gray-500 focus:ring-brand-blue focus:border-brand-blue"
                    placeholder="Confirm Password"
                  />
                </div>
              </div>
              <div className="flex flex-col justify-between items-start space-y-2">
                <span>Bio</span>
                <textarea
                  className="w-full rounded-md border-gray-300 dark:border-gray-500"
                />
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="font-bold p-3">Visibility Options</div>
            <div className="bg-gray-100 flex flex-col space-y-6 w-full px-3 py-2 rounded-lg">
              {visibilityOptions.map(option => {
                return (
                  <div className="flex justify-between items-center" key={option.value}>
                    <span>{option.label}</span>
                    <input
                      type="checkbox"
                      id={`checkbox-${option.value}`}
                      className="cursor-pointer rounded-lg"
                      checked={option.isVisible}
                      onChange={(e) => {

                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          <button
            onClick={() => {}}
            className="w-full m-3 py-2 text-white rounded-lg bg-brand-blue hover:bg-blue-800"
          >Save Profile</button>
        </div>
      </div>
    </>
  )
}

export default Account
