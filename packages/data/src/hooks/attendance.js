import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../context/ApiContext';
import { useTenantScope } from '../context/TenantContext';
import { qk } from '../query/keys';

export function useAttendanceToday(roomId) {
  const api = useApi();
  const scope = useTenantScope();
  const today = new Date().toISOString().slice(0, 10);
  return useQuery({
    queryKey: qk.attendance.today(scope.nurseryId, roomId),
    queryFn: () => api.attendance.list(scope, { roomId, on: today }),
  });
}

export function useCheckIn() {
  const api = useApi();
  const scope = useTenantScope();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.attendance.checkIn(scope, input),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ['nursery', scope.nurseryId, 'attendance'],
        exact: false,
      }),
  });
}

export function useCheckOut() {
  const api = useApi();
  const scope = useTenantScope();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (attendanceId) => api.attendance.checkOut(scope, attendanceId),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ['nursery', scope.nurseryId, 'attendance'],
        exact: false,
      }),
  });
}
