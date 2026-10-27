import { useQuery } from '@tanstack/react-query';
import { sessionApi } from '@/dtos';
import { sessionKeys } from '../keys';

/** Person for the current cookie. Empty when nobody is signed in. */
export function useSession() {
  return useQuery({
    queryKey: sessionKeys.current,
    queryFn: () => sessionApi.current(),
  });
}
