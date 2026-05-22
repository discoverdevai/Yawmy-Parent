import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../context/ApiContext';
import { useTenantScope } from '../context/TenantContext';
import { qk } from '../query/keys';

export function useUsers() {
  const api = useApi();
  const scope = useTenantScope();
  return useQuery({
    queryKey: qk.users.all(scope.nurseryId),
    queryFn: () => api.enrollment.listUsers(scope),
  });
}

export function useInviteStaff() {
  const api = useApi();
  const scope = useTenantScope();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.enrollment.inviteStaff(scope, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.users.all(scope.nurseryId) }),
  });
}

export function useInviteParent() {
  const api = useApi();
  const scope = useTenantScope();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.enrollment.inviteParent(scope, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.users.all(scope.nurseryId) });
      qc.invalidateQueries({ queryKey: qk.children.all(scope.nurseryId) });
    },
  });
}
