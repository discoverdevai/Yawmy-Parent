import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../context/ApiContext';
import { useTenantScope } from '../context/TenantContext';
import { qk } from '../query/keys';

export function useAnnouncements() {
  const api = useApi();
  const scope = useTenantScope();
  return useQuery({
    queryKey: qk.announcements.all(scope.nurseryId),
    queryFn: () => api.announcements.list(scope),
  });
}

export function useCreateAnnouncement() {
  const api = useApi();
  const scope = useTenantScope();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.announcements.create(scope, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.announcements.all(scope.nurseryId) }),
  });
}

export function useUpdateAnnouncement() {
  const api = useApi();
  const scope = useTenantScope();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }) => api.announcements.update(scope, id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.announcements.all(scope.nurseryId) }),
  });
}

export function useDeleteAnnouncement() {
  const api = useApi();
  const scope = useTenantScope();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.announcements.remove(scope, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.announcements.all(scope.nurseryId) }),
  });
}
