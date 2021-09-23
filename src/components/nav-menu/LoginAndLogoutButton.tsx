import { useSession, signIn, signOut } from 'next-auth/client'

const LoginAndLogoutButton = () => {
  const [session] = useSession()

  const onClickHandler = () => (session?.accessToken ? signOut() : signIn())

  return (
    <button
      onClick={onClickHandler}
      className="px-4 py-2 ml-2 text-sm text-white rounded bg-brand-blue"
    >
      {session?.accessToken ? 'Sign out' : 'Log in'}
    </button>
  )
}

export default LoginAndLogoutButton
