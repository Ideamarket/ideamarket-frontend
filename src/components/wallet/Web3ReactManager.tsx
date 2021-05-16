import { useEagerConnect, useInactiveListener } from 'wallets/hooks'

export default function Web3ReactManager({
  children,
}: {
  children: JSX.Element
}) {
  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEager)

  return children
}
