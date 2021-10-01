import { getSession } from 'next-auth/client'
import { useQuery } from 'react-query'

/**
 * Hook for managing session globally
 */
export function useCustomSession() {
  const {
    data: session,
    isLoading: loading,
    refetch: refetchSession,
  } = useQuery('session', () => getSession())
  return { session, loading, refetchSession } as const
}
