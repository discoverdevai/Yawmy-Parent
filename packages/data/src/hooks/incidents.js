import { useQuery } from '@tanstack/react-query';
import { useApi } from '../context/ApiContext';
import { useTenantScope } from '../context/TenantContext';
import { qk } from '../query/keys';

export function useIncidents() {
  const api = useApi();
  const scope = useTenantScope();
  return useQuery({
    queryKey: qk.incidents.all(scope.nurseryId),
    queryFn: () => api.incidents.list(scope),
  });
}

export function useIncident(id) {
  const api = useApi();
  const scope = useTenantScope();
  return useQuery({
    queryKey: qk.incidents.detail(scope.nurseryId, id),
    queryFn: () => api.incidents.get(scope, id),
    enabled: !!id,
  });
}
