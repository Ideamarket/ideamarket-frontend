import { GlobalContext } from './GlobalContext'
import { useContext, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { getAccount, loginAccount, registerAccount } from './axios'
import { useMutation } from 'react-query'
import { SignedAddress } from 'types/customTypes'
import ModalService from 'components/modals/ModalService'
import ProfileSettingsModal from 'components/account/ProfileSettingsModal'

export const ClientWrapper: React.FC = ({ children }) => {
  const { active, account, library } = useWeb3React()
  const { setJwtToken, setUser, setSignedWalletAddress } =
    useContext(GlobalContext)

  const [walletVerificationRequest] = useMutation<{
    message: string
    data: any
  }>(() =>
    fetch('/api/walletVerificationRequest', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(async (res) => {
      if (!res.ok) {
        const response = await res.json()
        throw new Error(response.message)
      }
      return res.json()
    })
  )

  const getSignedInWalletAddress = async (): Promise<SignedAddress> => {
    const { data } = await walletVerificationRequest()
    const message: string = data?.uuid
    let signature: string = null

    if (message) {
      signature = await library?.eth?.personal?.sign(message, account, '')
    }
    return message && signature
      ? {
          message,
          signature,
        }
      : null
  }

  const onChangeJwtToken = (
    token: string,
    signedWalletAddress?: SignedAddress
  ): void => {
    sessionStorage.setItem('jwtToken', token)
    setJwtToken(token)

    if (token && signedWalletAddress) {
      getAccount({ token })
        .then((response) => {
          if (response?.data?.success) {
            const { data } = response.data
            setUser(data)
          }
        })
        .catch((error) => console.log('error', error))
    } else {
      sessionStorage.removeItem('jwtToken')
    }
  }

  const registerByWallet = async (signedWalletAddress: SignedAddress) => {
    try {
      const response = await registerAccount({ signedWalletAddress })
      if (response.data?.success && response.data?.data) {
        const { data } = response.data
        setUser(data)
        await loginByWallet()
        ModalService.open(ProfileSettingsModal)
      } else {
        throw new Error('Failed to register')
      }
    } catch (error) {
      console.log('Failed to register', error)
    }
  }

  const loginByWallet = async () => {
    setUser({})
    const sessionSignatures =
      JSON.parse(sessionStorage.getItem('signatures')) || {}

    let signedWalletAddress: SignedAddress
    if (sessionSignatures[account]) {
      signedWalletAddress = {
        signature: sessionSignatures[account].signature,
        message: sessionSignatures[account].message,
      }
    } else {
      signedWalletAddress = await getSignedInWalletAddress()
      sessionSignatures[account] = signedWalletAddress
      sessionStorage.setItem('signatures', JSON.stringify(sessionSignatures))
    }
    setSignedWalletAddress(signedWalletAddress)

    try {
      const response = await loginAccount({
        signedWalletAddress,
      })
      if (response.data?.success && response.data?.data) {
        const {
          data: { tokenValue },
        } = response.data
        onChangeJwtToken(tokenValue, signedWalletAddress)
      } else {
        throw new Error('Failed to login')
      }
    } catch (error) {
      console.log('Failed to login', error)
      onChangeJwtToken(null)
      registerByWallet(signedWalletAddress)
    }
  }

  useEffect(() => {
    if (active && account) {
      loginByWallet()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, account])

  return <>{children}</>
}
