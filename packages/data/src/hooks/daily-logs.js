import { useQuery } from '@tanstack/react-query';
import { useApi } from '../context/ApiContext';
import { useTenantScope } from '../context/TenantContext';
import { qk } from '../query/keys';

/** All published logs for one child, newest first. */
export function useDailyLogsByChild(childId) {
  const api = useApi();
  const scope = useTenantScope();
  return useQuery({
    queryKey: qk.dailyLogs.byChild(scope.nurseryId, childId),
    queryFn: () => api.dailyLogs.listByChild(scope, childId),
    enabled: !!childId,
  });
}

/** Single log for a child on a given YYYY-MM-DD. Returns null if not published. */
export function useDailyLog(childId, date) {
  const api = useApi();
  const scope = useTenantScope();
  return useQuery({
    queryKey: qk.dailyLogs.onDate(scope.nurseryId, childId, date),
    queryFn: () => api.dailyLogs.getByDate(scope, childId, date),
    enabled: !!childId && !!date,
  });
}
