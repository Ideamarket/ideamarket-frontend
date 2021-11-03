// Inspired by https://github.com/spiehdid/react-mixpanel-provider-component

import {
  createContext,
  useContext,
  ComponentType,
  FunctionComponent,
  ReactNode,
} from 'react'
import mixpanel, { Mixpanel } from 'mixpanel-browser'
import { useWeb3React } from '@web3-react/core'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()
const { MIX_PANEL_KEY } = publicRuntimeConfig

interface WithMixPanel {
  mixpanel: Mixpanel
}

const MixPanelContext = createContext({} as WithMixPanel)

const useMixPanel = () => useContext(MixPanelContext)

function withMixpanel<T>(
  Component: ComponentType<T>
): FunctionComponent<T & WithMixPanel> {
  return (props: T) => <Component {...props} mixpanel={mixpanel} />
}

const MixPanelProvider = ({ children }: { children: ReactNode }) => {
  const { account } = useWeb3React()

  mixpanel.init(MIX_PANEL_KEY)

  const mixpanelWithWallet = {
    ...mixpanel,
    track: (key, params) =>
      mixpanel.track(key, {
        ...params,
        walletAddress: account || null,
      }),
  }

  return (
    <MixPanelContext.Provider value={{ mixpanel: mixpanelWithWallet }}>
      {children}
    </MixPanelContext.Provider>
  )
}

export { useMixPanel, withMixpanel, MixPanelContext }
export default MixPanelProvider
