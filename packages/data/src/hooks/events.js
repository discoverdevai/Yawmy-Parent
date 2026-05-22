import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../context/ApiContext';
import { useTenantScope } from '../context/TenantContext';
import { qk } from '../query/keys';

export function useEvents() {
  const api = useApi();
  const scope = useTenantScope();
  return useQuery({
    queryKey: qk.events.all(scope.nurseryId),
    queryFn: () => api.events.list(scope),
  });
}

export function useCreateEvent() {
  const api = useApi();
  const scope = useTenantScope();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.events.create(scope, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.events.all(scope.nurseryId) }),
  });
}

export function useUpdateEvent() {
  const api = useApi();
  const scope = useTenantScope();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }) => api.events.update(scope, id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.events.all(scope.nurseryId) }),
  });
}

export function useDeleteEvent() {
  const api = useApi();
  const scope = useTenantScope();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.events.remove(scope, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.events.all(scope.nurseryId) }),
  });
}
