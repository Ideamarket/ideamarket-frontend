import { useContext, useState } from 'react'
import Modal from '../modals/Modal'
import { GlobalContext } from 'lib/GlobalContext'
import { checkAccountEmailVerificationCode } from 'lib/axios'
import { CircleSpinner } from 'components'

export default function EmailVerificationCode({
  close,
  verifyEmail,
}: {
  close: () => void
  verifyEmail: (val: boolean) => void
}) {
  const { user, setUser, jwtToken } = useContext(GlobalContext)
  const [verified, setVerified] = useState(undefined)
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState(['', '', '', '', '', ''])
  //   const [time, setTime] = useState(30)

  const verifyCode = async () => {
    setLoading(true)
    try {
      const response = await checkAccountEmailVerificationCode({
        token: jwtToken,
        code: code.join(''),
      })
      if (
        response.data?.success &&
        response.data?.data &&
        response.data.data.emailVerified
      ) {
        setUser({ ...user, emailVerified: true })
        close()
      } else {
        throw new Error('Failed to verify an email')
      }
    } catch (error) {
      console.log('Failed to verify an email', error)
      setVerified(false)
      return null
    } finally {
      setLoading(false)
    }
  }

  const onClickSendCode = () => {
    verifyEmail(false)
    // setTime(30)
  }
  //   useEffect(() => {
  //     const intervalId = setInterval(() => {
  //       setTime((c) => (c > 1 ? c - 1 : 0))
  //     }, 1000)
  //     return () => clearInterval(intervalId)
  //   }, [])

  const onInputChange = (e, index) => {
    setCode((c) => {
      const newCode = [...c]
      newCode[index] = e.target.value
      return newCode
    })
    const nextSibling = document.getElementById(`input-${index + 1}`)
    if (nextSibling !== null) {
      nextSibling.focus()
    }
  }
  return (
    <Modal close={close}>
      <div className="py-6 px-8 bg-white w-full md:w-[28rem]">
        <div className="flex justify-between items-center">
          <span className="text-2xl text-center text-black text-opacity-90 md:text-3xl font-gilroy-bold font-bold">
            Verify your email!
          </span>
        </div>
        <p className="my-6 font-inter opacity-50">
          A verification code has been sent to the following email address. Fill
          in the code below to verify your email.
        </p>
        <div className="grid grid-cols-6 gap-2">
          {code.map((item, index) => (
            <input
              className="pl-2 w-full h-10 leading-tight border rounded appearance-none focus:outline-none focus:bg-white"
              id={`input-${index}`}
              key={index}
              value={code[index]}
              maxLength={1}
              onChange={(e) => onInputChange(e, index)}
            />
          ))}
        </div>
        <div className="flex my-6 place-content-center font-inter text-sm">
          {/* <span className="text-brand-blue font-semibold mr-3">00:{time}</span> */}
          <span
            className="opacity-50 font-medium cursor-pointer"
            onClick={onClickSendCode}
          >
            Send Code Again
          </span>
        </div>
        {verified === false && loading === false && (
          <p className="text-red-400 my-6 text-center">
            Please check the code you had entered
          </p>
        )}
        <div className="flex">
          <button
            className="w-full font-sf-compact-medium text-base font-medium text-gray-700 p-3 bg-gray-200 rounded-xl mr-2"
            onClick={() => close && close()}
          >
            Cancel
          </button>
          <button
            className="w-full font-sf-compact-medium text-base font-medium text-white p-3 bg-brand-blue border-brand-blue rounded-xl flex items-center place-content-center"
            onClick={verifyCode}
          >
            {loading && <CircleSpinner color="#0857e0" />}
            <span className="ml-1">{loading ? 'Processing' : 'Verify'}</span>
          </button>
        </div>
      </div>
    </Modal>
  )
}
