import React, { useEffect, useState } from 'react'
import { NETWORK, INetworkSpecifics } from 'store/networks'

interface GlobalContextState {
  onWalletConnectedCallback: () => void
  setOnWalletConnectedCallback: (f: () => void) => void
  isEmailFooterActive: Boolean
  setIsEmailFooterActive: (val: boolean) => void
  requiredNetwork: null | INetworkSpecifics
  setRequiredNetwork: (val: INetworkSpecifics) => void
  jwtToken: null | string
  setJwtToken: (val: string) => void
  user: any
  setUser: (val: any) => void
  signedWalletAddress: any
  setSignedWalletAddress: (val: any) => void
}

export const initialState: GlobalContextState = {
  onWalletConnectedCallback: () => {},
  setOnWalletConnectedCallback: (f: () => void) => {},
  isEmailFooterActive: false,
  setIsEmailFooterActive: (val: boolean) => {},
  requiredNetwork: null,
  setRequiredNetwork: (val: INetworkSpecifics) => {},
  jwtToken: null,
  setJwtToken: (val: string) => {},
  user: {},
  setUser: (val: any) => {},
  signedWalletAddress: {},
  setSignedWalletAddress: (val: any) => {},
}

export const GlobalContext = React.createContext(initialState)

interface Props {}

export const GlobalContextComponent: React.FC<Props> = ({ children }) => {
  const [onWalletConnectedCallback, setOnWalletConnectedCallback] = useState(
    () => () => {}
  )
  const [requiredNetwork, setRequiredNetwork] = useState(NETWORK)
  const [isEmailFooterActive, setIsEmailFooterActive] = useState(false)
  const [jwtToken, setJwtToken] = useState(null)
  const [user, setUser] = useState({})
  const [signedWalletAddress, setSignedWalletAddress] = useState({})

  useEffect(() => {
    const isEmailBarClosed = localStorage.getItem('IS_EMAIL_BAR_CLOSED')
      ? localStorage.getItem('IS_EMAIL_BAR_CLOSED') === 'true'
      : false
    setIsEmailFooterActive(!isEmailBarClosed)
    const migrationModalSeen = localStorage.getItem('MIGRATION_MODAL_SEEN')
    if (migrationModalSeen !== 'true') {
      //ModalService.open(MigrationDoneModal)
    }
  }, [])

  return (
    <GlobalContext.Provider
      value={{
        onWalletConnectedCallback,
        setOnWalletConnectedCallback,
        isEmailFooterActive,
        setIsEmailFooterActive,
        requiredNetwork,
        setRequiredNetwork,
        jwtToken,
        setJwtToken,
        user,
        setUser,
        signedWalletAddress,
        setSignedWalletAddress,
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}
