import { useMutation, useQuery } from '@tanstack/react-query';
import { useApi } from '../context/ApiContext';
import { useTenantScope } from '../context/TenantContext';
import { qk } from '../query/keys';

export function useExportRequest() {
  const api = useApi();
  const scope = useTenantScope();
  return useMutation({
    mutationFn: (input) => api.export.request(scope, input),
  });
}

export function useExportJob(jobId) {
  const api = useApi();
  const scope = useTenantScope();
  return useQuery({
    queryKey: qk.export.job(scope.nurseryId, jobId),
    queryFn: () => api.export.status(scope, jobId),
    enabled: !!jobId,
    refetchInterval: (q) => (q.state.data?.status === 'pending' ? 1000 : false),
  });
}
