import { useState, useEffect, useCallback } from 'react';
import { appointmentsApi, CreateAppointmentPayload } from '../../../api/appointments.api';
import { AppointmentItem } from '../../../types/api';

const DEFAULT_APPOINTMENTS: AppointmentItem[] = [
  {
    id: '1',
    tailorId: '1',
    tailorName: 'Rekha Tailors',
    tailorAvatar: require('@/assets/illustrations/customer-tabs/tailors/rekha.png'),
    serviceType: 'Bridal Lehenga Measurement',
    appointmentDate: 'Thu, Oct 24',
    appointmentTime: '11:00 AM',
    status: 'Upcoming',
    notes: 'Bring reference fabric swatches',
    location: 'Studio Visit - C-Scheme, Jaipur',
  },
  {
    id: '2',
    tailorId: '2',
    tailorName: 'Stitch Craft',
    tailorAvatar: require('@/assets/illustrations/customer-tabs/tailors/stitch-craft.png'),
    serviceType: 'Bespoke Suit Fitting',
    appointmentDate: 'Mon, Oct 28',
    appointmentTime: '03:30 PM',
    status: 'Upcoming',
    location: 'Home Measurement Service',
  },
];

export function useAppointments(statusFilter?: string) {
  const [appointments, setAppointments] = useState<AppointmentItem[]>(DEFAULT_APPOINTMENTS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await appointmentsApi.getMyAppointments().catch(() => appointmentsApi.getAppointments({ status: statusFilter }));
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setAppointments(res.data);
      } else {
        setAppointments(DEFAULT_APPOINTMENTS);
      }
    } catch (err: any) {
      console.warn('Failed to load appointments from backend, using fallback:', err.message);
      setError(err.message || 'Failed to load appointments');
      setAppointments(DEFAULT_APPOINTMENTS);
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
