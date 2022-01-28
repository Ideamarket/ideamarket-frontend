import { useContext, useMemo, useReducer, useRef, useState } from 'react'
import Modal from '../modals/Modal'
import Image from 'next/image'
import { FaRegTrashAlt } from 'react-icons/fa'
import { BsCheck2Circle } from 'react-icons/bs'
import { MdOutlineAddPhotoAlternate } from 'react-icons/md'
import { IoMdInformationCircle } from 'react-icons/io'
import { GlobalContext } from 'lib/GlobalContext'
import { useEffect } from 'react'
import {
  sendVerificationCodeToAccountEmail,
  updateAccount,
  uploadAccountPhoto,
} from 'lib/axios'
import { CircleSpinner, Tooltip } from 'components'
import { UserProfile } from 'types/customTypes'
import ModalService from 'components/modals/ModalService'
import EmailVerificationCode from './EmailVerificationCode'
import classNames from 'classnames'

const reducer = (state, action: any) => {
  switch (action.type) {
    case 'reset':
      return {
        ...action.payload,
      }
    case 'set-name':
      return { ...state, name: action.payload }
    case 'set-username':
      return { ...state, username: action.payload }
    case 'set-bio':
      return { ...state, bio: action.payload }
    case 'set-email':
      return { ...state, email: action.payload }
    case 'set-walletAddress':
      return { ...state, walletAddress: action.payload }
    case 'set-profilePhoto':
      return { ...state, profilePhoto: action.payload }
    default:
      return state
  }
}
const initialState: UserProfile = {
  name: '',
  username: '',
  bio: '',
  email: '',
  walletAddress: '',
  profilePhoto: undefined,
}

export default function ProfileSettingsModal({ close }: { close: () => void }) {
  const { user: currentUser, setUser, jwtToken } = useContext(GlobalContext)
  const [user, dispatch] = useReducer(reducer, initialState)

  const { name, username, bio, email, walletAddress, profilePhoto } = user
  const isEmailValid = useMemo(
    () =>
      email?.match(
        // eslint-disable-next-line react-hooks/exhaustive-deps
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      ),
    [email]
  )

  const [loading, setLoading] = useState<Boolean>(false)
  const [previewImage, setPreviewImage] = useState(undefined)
  const [validationError, setValidationError] = useState(initialState)
  const [successToastPos, setPosition] = useState(0)

  useEffect(() => {
    dispatch({ type: 'reset', payload: currentUser })
  }, [currentUser])

  const updateUser = async (requestBody) => {
    setValidationError(initialState)
    try {
      const response = await updateAccount({ requestBody, token: jwtToken })
      if (response.data?.success && response.data?.data) {
        setUser(response.data.data)
        setTimeout(() => {
          setPosition(1)
        }, 100)
        setTimeout(() => {
          setPosition(0)
        }, 1000)
      } else {
        throw new Error('Failed to update')
      }
    } catch (error) {
      console.log('Failed to update', error.response)
      const errors = error.response?.data?.errors
      let errorsObj = {}
      if (errors && errors.length) {
        errors.forEach((error) => {
          errorsObj = {
            ...errorsObj,
            ...error,
          }
        })
        setValidationError(errorsObj)
      }
    } finally {
    }
  }

  const onSaveChanges = async () => {
    setLoading(true)
    let profilePhoto
    const requestBody = {
      name,
      username,
      bio,
      profilePhoto,
    }

    if (fileUploadState === '') {
      // removing profile photo
      requestBody['profilePhoto'] = ''
    } else if (fileUploadState) {
      profilePhoto = await uploadProfilePhoto(fileUploadState)
    }

    if (profilePhoto) {
      requestBody['profilePhoto'] = profilePhoto
    }
    await updateUser(requestBody)
    setLoading(false)
  }

  const inputRef = useRef(null)
  const [fileUploadState, setFileUploadState] = useState(undefined)

  const fileUploadAction = () => inputRef.current.click()
  const fileRemoveAction = () => {
    setFileUploadState('')
    dispatch({
      type: 'set-profilePhoto',
      payload: '',
    })
    setPreviewImage('')
  }
  const fileUploadInputChange = (e) => {
    setFileUploadState(e.target.files[0])
    setPreviewImage(URL.createObjectURL(e.target.files[0]))
  }
  const uploadProfilePhoto = async (fileUploadState) => {
    const formData = new FormData()
    // Update the formData object
    formData.append('profilePhoto', fileUploadState)
    try {
      const response = await uploadAccountPhoto({ formData, token: jwtToken })
      if (response.data?.success && response.data?.data) {
        return response.data.data.profilePhotoUrl.replace(
          `${process.env.NEXT_PUBLIC_USER_ACCOUNTS_CLOUDFRONT_DOMAIN}/`,
          ''
        )
      }
      throw new Error('Failed to Upload')
    } catch (error) {
      console.log('Failed to Upload', error)
      return null
    }
  }

  const verifyEmail = async (openModal?: boolean) => {
    setValidationError(initialState)
    sendVerificationCodeToAccountEmail({
      token: jwtToken,
      email,
    })
      .then((response) => {
        if (
          response.data?.success &&
          response.data?.data &&
          response.data?.data?.codeSent
        ) {
          openModal &&
            ModalService.open(EmailVerificationCode, { verifyEmail, email })
        } else {
          setValidationError({ email: response.data?.data?.messge })
        }
      })
      .catch((error) => {
        console.log('error', error)
      })
  }

  return (
    <Modal close={close}>
      <div
        className={classNames(
          'transition-all duration-[1000ms] ease-in shadow-2xl rounded-lg text-base text-gray-500 font-medium font-inter bg-white p-4 absolute w-72 left-0 right-0 mx-auto',
          !successToastPos ? 'invisible top-0' : 'visible top-10'
        )}
        style={{
          boxShadow: '0px 9.87664px 24.6916px rgba(0, 0, 0, 0.25)',
        }}
      >
        <p>
          <span>
            <BsCheck2Circle className="w-6 h-6 text-green-500" />
          </span>{' '}
          Changes saved successfully!
        </p>
      </div>
      <div className="p-6 bg-white w-full md:w-[28rem]">
        <div className="flex justify-between items-center">
          <span className="text-2xl text-center text-black text-opacity-90 md:text-3xl font-gilroy-bold font-bold">
            Settings
          </span>
          <button
            className="text-base text-white font-medium p-3 bg-brand-blue border-brand-blue rounded-xl flex items-center"
            onClick={onSaveChanges}
          >
            {loading && <CircleSpinner color="#0857e0" />}
            <span className="ml-1">
              {loading ? 'Processing' : 'Save Changes'}
            </span>
          </button>
        </div>

        <div className="flex items-center my-4">
          <div className="relative w-20 h-20 rounded-full bg-gray-400 ">
            <Image
              src={previewImage || profilePhoto || '/avatar.png'}
              alt="Profile image"
              layout="fill"
              objectFit="cover"
              className="rounded-full"
            />
            <input
              type="file"
              hidden
              ref={inputRef}
              onChange={fileUploadInputChange}
            />
            <div
              className="cursor-pointer absolute w-7 h-7 rounded-full shadow-shadow-1 bottom-0 bg-white p-1"
              onClick={fileUploadAction}
            >
              <MdOutlineAddPhotoAlternate className="w-5 h-5" />
            </div>
            <div
              className="cursor-pointer absolute w-7 h-7 rounded-full shadow-shadow-1 bottom-0 right-0 bg-white p-1"
              onClick={fileRemoveAction}
            >
              <FaRegTrashAlt className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <div className="flex flex-col grow ml-5" style={{ flexGrow: 1 }}>
            <div className="flex flex-col w-full mt-2">
              <div className="flex ml-2 mb-1 items-center">
                <p className="text-sm text-black text-opacity-50">
                  Display name
                </p>
                <div className="ml-auto">
                  <Tooltip
                    IconComponent={IoMdInformationCircle}
                    iconComponentClassNames="text-gray-400"
                  >
                    <div className="w-32 md:w-64">
                      Your display name should contain...
                    </div>
                  </Tooltip>
                </div>
              </div>
              <input
                className="pl-2 w-full h-14 mb-1 leading-tight border rounded focus:outline-none focus:bg-white dark:focus:bg-gray-700"
                value={name}
                onChange={(event) =>
                  dispatch({ type: 'set-name', payload: event.target.value })
                }
              />
            </div>
            {Boolean(validationError.name) && (
              <p className="text-red-700 mb-3">{validationError.name}</p>
            )}
          </div>
        </div>

        <div className="flex items-center mb-2 mt-4">
          <span className="text-sm text-black text-opacity-50">Username</span>
        </div>

        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2">
            <button
              type="submit"
              className="p-1 focus:outline-none focus:shadow-outline"
            >
              @
            </button>
          </span>
          <input
            name="username"
            className="pl-10 w-full h-10 leading-tight border rounded appearance-none focus:outline-none focus:bg-white dark:focus:bg-gray-700"
            value={username}
            onChange={(event) =>
              dispatch({
                type: 'set-username',
                payload: event.target.value,
              })
            }
          />
        </div>
        {Boolean(validationError.username) && (
          <p className="text-red-700 mb-3">{validationError.username}</p>
        )}

        <div className="flex items-center mb-2 mt-4">
          <span className="text-sm text-black text-opacity-50">Bio</span>
        </div>
        <textarea
          className="pl-2 w-full h-20 leading-tight border rounded appearance-none focus:outline-none focus:bg-white dark:focus:bg-gray-700"
          value={bio}
          onChange={(event) =>
            dispatch({ type: 'set-bio', payload: event.target.value })
          }
        />

        <div className="flex items-center mb-2 mt-4">
          <span className="text-sm text-black text-opacity-50">
            Email Address
          </span>
        </div>
        <input
          className="pl-2 w-full h-10 leading-tight border rounded appearance-none focus:outline-none focus:bg-white dark:focus:bg-gray-700"
          value={email || ''}
          onChange={(event) =>
            dispatch({ type: 'set-email', payload: event.target.value })
          }
        />
        {currentUser.email !== email && (
          <button
            className={classNames(
              'w-full text-base text-white font-medium p-3 rounded-xl mt-2',
              !isEmailValid
                ? 'border-gray-200 focus:border-brand-blue bg-gray-400 cursor-default'
                : ' bg-brand-blue border-brand-blue'
            )}
            disabled={!isEmailValid}
            onClick={() => verifyEmail(true)}
          >
            Verify Email
          </button>
        )}

        <div className="flex items-center mb-2 mt-4">
          <span className="text-sm text-black text-opacity-50">
            ETH Address
          </span>
        </div>
        <input
          className="pl-2 w-full h-10 leading-tight border rounded appearance-none focus:outline-none focus:bg-white dark:focus:bg-gray-700"
          value={walletAddress}
          onChange={(event) =>
            dispatch({ type: 'set-walletAddress', payload: event.target.value })
          }
          disabled
        />
      </div>
    </Modal>
  )
}
