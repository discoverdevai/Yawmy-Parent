import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../context/ApiContext';
import { useTenantScope } from '../context/TenantContext';
import { qk } from '../query/keys';

export function useRooms() {
  const api = useApi();
  const scope = useTenantScope();
  return useQuery({
    queryKey: qk.rooms.all(scope.nurseryId),
    queryFn: () => api.rooms.list(scope),
  });
}

export function useRoom(id) {
  const api = useApi();
  const scope = useTenantScope();
  return useQuery({
    queryKey: qk.rooms.detail(scope.nurseryId, id),
    queryFn: () => api.rooms.get(scope, id),
    enabled: !!id,
  });
}

export function useCreateRoom() {
  const api = useApi();
  const scope = useTenantScope();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.rooms.create(scope, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.rooms.all(scope.nurseryId) }),
  });
}

export function useUpdateRoom() {
  const api = useApi();
  const scope = useTenantScope();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }) => api.rooms.update(scope, id, patch),
    onSuccess: (room) => {
      qc.setQueryData(qk.rooms.detail(scope.nurseryId, room.id), room);
      qc.invalidateQueries({ queryKey: qk.rooms.all(scope.nurseryId) });
    },
  });
}

export function useArchiveRoom() {
  const api = useApi();
  const scope = useTenantScope();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.rooms.archive(scope, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.rooms.all(scope.nurseryId) }),
  });
}

export function useAssignTeachers() {
  const api = useApi();
  const scope = useTenantScope();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, teacherIds }) => api.rooms.assignTeachers(scope, id, teacherIds),
    onSuccess: (room) => {
      qc.setQueryData(qk.rooms.detail(scope.nurseryId, room.id), room);
      qc.invalidateQueries({ queryKey: qk.rooms.all(scope.nurseryId) });
    },
  });
}
