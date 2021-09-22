import { useSession, signIn, signOut } from 'next-auth/client'

const LoginAndLogoutButton = () => {
  const [session] = useSession()

  return (
    <button
      onClick={() =>
        session?.accessToken ? signOut({ callbackUrl: '/' }) : signIn()
      }
      className="px-4 py-1 ml-2 text-white rounded bg-brand-blue"
    >
      {session?.accessToken ? 'Sign out' : 'Log in'}
    </button>
  )
}

export default LoginAndLogoutButton
