import { signIn, signOut } from 'next-auth/client'
import { useCustomSession } from 'utils/useCustomSession'

const LoginAndLogoutButton = () => {
  const { session } = useCustomSession()

  const onClickHandler = () => (session?.accessToken ? signOut() : signIn())

  return (
    <button
      onClick={onClickHandler}
      className="px-4 py-2 ml-2 text-sm text-white rounded-lg bg-brand-blue"
    >
      {session?.accessToken ? 'Sign out' : 'Log in'}
    </button>
  )
}

export default LoginAndLogoutButton
