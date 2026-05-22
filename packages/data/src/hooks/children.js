
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../context/ApiContext';
import { useTenantScope } from '../context/TenantContext';
import { qk } from '../query/keys';

export function useChildren(params = {}) {
  const api = useApi();
  const scope = useTenantScope();
  return useQuery({
    queryKey: qk.children.list(scope.nurseryId, params),
    queryFn: () => api.children.list(scope, params),
  });
}

export function useChild(id) {
  const api = useApi();
  const scope = useTenantScope();
  return useQuery({
    queryKey: qk.children.detail(scope.nurseryId, id),
    queryFn: () => api.children.get(scope, id),
    enabled: !!id,
  });
}

export function useCreateChild() {
  const api = useApi();
  const scope = useTenantScope();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.children.create(scope, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.children.all(scope.nurseryId) }),
  });
}

export function useUpdateChild() {
  const api = useApi();
  const scope = useTenantScope();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }) => api.children.update(scope, id, patch),
    onSuccess: (child) => {
      qc.setQueryData(qk.children.detail(scope.nurseryId, child.id), child);
      qc.invalidateQueries({ queryKey: qk.children.all(scope.nurseryId) });
    },
  });
}

export function useUnenrollChild() {
  const api = useApi();
  const scope = useTenantScope();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.children.unenroll(scope, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.children.all(scope.nurseryId) }),
  });
}

export function useAddPickupContact() {
  const api = useApi();
  const scope = useTenantScope();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ childId, contact }) => api.children.addPickupContact(scope, childId, contact),
    onSuccess: (_c, { childId }) =>
      qc.invalidateQueries({ queryKey: qk.children.detail(scope.nurseryId, childId) }),
  });
}

export function useRemovePickupContact() {
  const api = useApi();
  const scope = useTenantScope();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ childId, contactId }) => api.children.removePickupContact(scope, childId, contactId),
    onSuccess: (_c, { childId }) =>
      qc.invalidateQueries({ queryKey: qk.children.detail(scope.nurseryId, childId) }),
  });
}
