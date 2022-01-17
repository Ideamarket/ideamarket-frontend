import { GlobalContext } from './GlobalContext'
import { useContext, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { getAccount, loginAccount, registerAccount } from './axios'
import { useMutation } from 'react-query'
import { SignedAddress } from 'types/customTypes'

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
    signedWalletAddress: SignedAddress
  ): void => {
    sessionStorage.setItem('jwtToken', token)
    sessionStorage.setItem('signature', signedWalletAddress.signature)
    sessionStorage.setItem('message', signedWalletAddress.message)
    sessionStorage.setItem('walletaddress', account)
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
      sessionStorage.removeItem('signature')
      sessionStorage.removeItem('message')
      sessionStorage.removeItem('walletaddress')
    }
  }

  const registerByWallet = async (signedWalletAddress: SignedAddress) => {
    try {
      const response = await registerAccount({ signedWalletAddress })
      if (response.data?.success && response.data?.data) {
        const {
          data: { tokenValue },
        } = response.data
        onChangeJwtToken(tokenValue, signedWalletAddress)
        setUser(response.data.data)
      } else {
        throw new Error('Failed to register')
      }
    } catch (error) {
      console.log('Failed to register', error)
    }
  }

  const loginByWallet = async () => {
    const sessionSignature = sessionStorage.getItem('signature')
    const sessionMessage = sessionStorage.getItem('message')
    const sessionWalletaddress = sessionStorage.getItem('walletaddress')

    let signedWalletAddress: SignedAddress
    if (
      sessionWalletaddress === account &&
      sessionSignature &&
      sessionMessage
    ) {
      signedWalletAddress = {
        signature: sessionSignature,
        message: sessionMessage,
      }
    } else {
      sessionStorage.removeItem('signature')
      sessionStorage.removeItem('message')
      sessionStorage.removeItem('walletaddress')
      setUser({})
      signedWalletAddress = await getSignedInWalletAddress()
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
      onChangeJwtToken(null, signedWalletAddress)
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
