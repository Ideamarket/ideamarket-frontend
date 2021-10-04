import create from 'zustand'

type State = {
  session: any
  refetchSession: any
}

export const useSessionStore = create<State>((set) => ({
  session: undefined,
  refetchSession: undefined,
}))

export async function setSession(session, refetchSession) {
  useSessionStore.setState({
    session,
    refetchSession,
  })
}
