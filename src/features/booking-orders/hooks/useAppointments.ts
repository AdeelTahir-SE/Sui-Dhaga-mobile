import { useState, useEffect, useCallback } from 'react';
import { appointmentsApi, CreateAppointmentPayload } from '../../../api/appointments.api';
import { AppointmentItem } from '../../../types/api';

export function useAppointments(statusFilter?: string) {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await appointmentsApi.getMyAppointments().catch(() => appointmentsApi.getAppointments({ status: statusFilter }));
      if (res.data && Array.isArray(res.data)) {
        setAppointments(res.data);
      } else {
        setAppointments([]);
      }
    } catch (err: any) {
      console.warn('Failed to load appointments from backend:', err.message);
      setError(err.message || 'Failed to load appointments');
      setAppointments([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchAppointments();
  }, [fetchAppointments]);

  const createAppointment = async (payload: CreateAppointmentPayload) => {
    const res = await appointmentsApi.createAppointment(payload);
    await fetchAppointments();
    return res;
  };

  const cancelAppointment = async (id: string, reason?: string) => {
    const res = await appointmentsApi.cancelAppointment(id, reason);
    await fetchAppointments();
    return res;
  };

  return {
    appointments,
    isLoading,
    isRefreshing,
    error,
    refresh,
    createAppointment,
    cancelAppointment,
  };
}
