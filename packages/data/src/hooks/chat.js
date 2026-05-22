import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../context/ApiContext';
import { useTenantScope } from '../context/TenantContext';
import { qk } from '../query/keys';

export function useThreads() {
  const api = useApi();
  const scope = useTenantScope();
  return useQuery({
    queryKey: qk.chat.threads(scope.nurseryId),
    queryFn: () => api.chat.listThreads(scope),
  });
}

export function useThreadMessages(threadId) {
  const api = useApi();
  const scope = useTenantScope();
  return useQuery({
    queryKey: qk.chat.messages(scope.nurseryId, threadId),
    queryFn: () => api.chat.listMessages(scope, threadId),
    enabled: !!threadId,
  });
}

export function useSendMessage(threadId) {
  const api = useApi();
  const scope = useTenantScope();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.chat.send(scope, threadId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.chat.messages(scope.nurseryId, threadId) }),
  });
}

export function useRemoveMessage(threadId) {
  const api = useApi();
  const scope = useTenantScope();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (messageId) => api.chat.removeMessage(scope, threadId, messageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.chat.messages(scope.nurseryId, threadId) }),
  });
}

export function useBroadcast() {
  const api = useApi();
  const scope = useTenantScope();
  return useMutation({
    mutationFn: (input) => api.chat.broadcast(scope, input),
  });
}
