import { GlobalContext } from './GlobalContext'
import { useContext, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { getCookie } from 'services/CookieService'
import useAuth from 'components/account/useAuth'
import { getPublicProfile } from './axios'

export const ClientWrapper: React.FC = ({ children }) => {
  const { active, account } = useWeb3React()
  const { setJwtToken, setUser } = useContext(GlobalContext)

  const { setUserFromJwt } = useAuth()

  useEffect(() => {
    const initUserData = async () => {
      // List of wallet address <-> JWT pairs (named t)
      const jwtKeyValues = JSON.parse(getCookie('t')) || {}
      const jwt = jwtKeyValues[account]

      // If there is JWT (they are signed in), then fetch user data using JWT
      if (jwt) {
        setJwtToken(jwt)
        setUserFromJwt(jwt)
      } else {
        // If no JWT, fetch user data by sending connected wallet to API
        setJwtToken(null)
        const response = await getPublicProfile({
          username: null,
          walletAddress: account,
        })
        let userObject = { walletAddress: account, ...response }
        setUser(userObject)
      }
    }

    initUserData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, account])

  return <>{children}</>
}
