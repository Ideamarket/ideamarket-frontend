import { GlobalContext } from './GlobalContext'
import { useContext, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { getAccount, loginAccount, registerAccount } from './axios'
import { SignedAddress } from 'types/customTypes'
import ModalService from 'components/modals/ModalService'
import ProfileSettingsModal from 'components/account/ProfileSettingsModal'

export const ClientWrapper: React.FC = ({ children }) => {
  const { active, account } = useWeb3React()
  const { setJwtToken, setUser, signedWalletAddress, setSignedWalletAddress } =
    useContext(GlobalContext)

  const onChangeJwtToken = (
    token: string,
    signedWalletAddress?: SignedAddress
  ): void => {
    localStorage.setItem('jwtToken', token)
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
      localStorage.removeItem('jwtToken')
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
    setUser({})
    onChangeJwtToken(null)
    const sessionSignatures =
      JSON.parse(localStorage.getItem('signatures')) || {}
    const sessionSignature = sessionSignatures[account]
    if (
      sessionSignature?.signature !== signedWalletAddress?.signature ||
      sessionSignature?.message !== signedWalletAddress?.message
    ) {
      setSignedWalletAddress(sessionSignature)
    } else if (
      active &&
      account &&
      signedWalletAddress?.signature &&
      signedWalletAddress?.message
    ) {
      loginByWallet()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, account, signedWalletAddress])

  return <>{children}</>
}
