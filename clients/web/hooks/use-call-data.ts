import { useQuery } from '@tanstack/react-query'
import { UUID } from 'crypto'
import httpClient from '@/lib/http-client'
import { ReactQueryKeys } from '@/types/react-query'

export const useCallData = (callId: UUID) => {
  return useQuery({
    queryKey: [ReactQueryKeys.CALL_DETAILS, callId],
    queryFn: () => httpClient.getCallDetails(callId),
    select: (data) => data.data
  })
}