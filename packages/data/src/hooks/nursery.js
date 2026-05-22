import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../context/ApiContext';
import { useTenantScope } from '../context/TenantContext';
import { qk } from '../query/keys';

export function useNursery() {
  const api = useApi();
  const scope = useTenantScope();
  return useQuery({
    queryKey: qk.nursery.profile(scope.nurseryId),
    queryFn: () => api.nursery.get(scope),
  });
}

export function useUpdateNursery() {
  const api = useApi();
  const scope = useTenantScope();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch) => api.nursery.update(scope, patch),
    onSuccess: (next) => qc.setQueryData(qk.nursery.profile(scope.nurseryId), next),
  });
}

export function useUpdateGeofence() {
  const api = useApi();
  const scope = useTenantScope();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (geofence) => api.nursery.updateGeofence(scope, geofence),
    onSuccess: (next) => qc.setQueryData(qk.nursery.profile(scope.nurseryId), next),
  });
}
