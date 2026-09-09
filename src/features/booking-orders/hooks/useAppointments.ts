import { useState, useEffect, useCallback } from 'react';
import { appointmentsApi, CreateAppointmentPayload } from '../../../api/appointments.api';
import { AppointmentItem } from '../../../types/api';

/**
 * Normalizes backend appointment data into a consistent UI model
 */
export function normalizeAppointment(raw: any): AppointmentItem {
  if (!raw || typeof raw !== 'object') {
    return raw;
  }

  const id = String(raw.id || raw._id || raw.appointmentId || '');
  const tailorId = raw.tailor_id || raw.tailorId || raw.tailor?.id || raw.tailor?._id || '';
  const customerId = raw.customer_id || raw.customerId || raw.userId || raw.customer?.id || raw.customer?._id || '';
  const serviceId = raw.service_id || raw.serviceId || raw.service?.id || raw.service?._id || '';

  const tailorName =
    raw.tailorName ||
    raw.tailor_name ||
    raw.tailor?.shopName ||
    raw.tailor?.shop_name ||
    raw.tailor?.fullName ||
    raw.tailor?.full_name ||
    raw.tailor?.name ||
    raw.tailor?.businessName ||
    raw.tailor?.business_name ||
    'Tailor';

  const tailorAvatar =
    raw.tailorAvatar ||
    raw.tailor_avatar ||
    raw.tailor?.avatar ||
    raw.tailor?.avatar_url ||
    raw.tailor?.profilePicture ||
    raw.tailor?.profileImage;

  const customerName =
    raw.customerName ||
    raw.customer_name ||
    raw.clientName ||
    raw.userName ||
    raw.customer?.fullName ||
    raw.customer?.full_name ||
    raw.customer?.name ||
    raw.user?.fullName ||
    raw.user?.full_name ||
    raw.user?.name ||
    'Customer';

  const customerAvatar =
    raw.customerAvatar ||
    raw.customer_avatar ||
    raw.clientAvatar ||
    raw.customer?.avatar ||
    raw.customer?.avatar_url ||
    raw.user?.avatar;

  const serviceType =
    raw.serviceType ||
    raw.service_type ||
    raw.serviceName ||
    raw.service?.name ||
    raw.service?.title ||
    raw.service?.serviceName ||
    'Tailoring Consultation';

  const appointmentDate =
    raw.appointment_date ||
    raw.appointmentDate ||
    raw.date ||
    raw.scheduledDate ||
    raw.scheduled_date ||
    '';
  const appointmentTime =
    raw.appointment_time ||
    raw.appointmentTime ||
    raw.time ||
    raw.scheduledTime ||
    raw.scheduled_time ||
    '';

  const rawStatus = raw.status || 'pending';
  const statusStr = String(rawStatus);
  const formattedStatus =
    statusStr.charAt(0).toUpperCase() + statusStr.slice(1).toLowerCase();

  const notes = raw.notes || raw.description || '';
  const location =
    raw.location ||
    raw.tailor?.location?.city ||
    raw.tailor?.address ||
    raw.tailor?.city ||
    '';

  const price =
    raw.price !== undefined && raw.price !== null
      ? Number(raw.price)
      : raw.service?.price !== undefined && raw.service?.price !== null
      ? Number(raw.service?.price)
      : undefined;

  const duration = raw.duration || raw.service?.duration || '60 mins';

  return {
    id,
    tailorId,
    tailor_id: tailorId,
    customerId,
    customer_id: customerId,
    serviceId,
    service_id: serviceId,
    tailorName,
    tailorAvatar,
    customerName,
    clientName: customerName,
    customerAvatar,
    clientAvatar: customerAvatar,
    userName: customerName,
    serviceType,
    service_type: serviceType,
    appointmentDate,
    appointmentTime,
    appointment_date: appointmentDate,
    appointment_time: appointmentTime,
    date: appointmentDate,
    time: appointmentTime,
    status: formattedStatus,
    notes,
    location,
    price,
    duration,
    createdAt: raw.createdAt || raw.created_at,
    created_at: raw.createdAt || raw.created_at,
    updatedAt: raw.updatedAt || raw.updated_at,
    updated_at: raw.updatedAt || raw.updated_at,
    tailor: raw.tailor,
    customer: raw.customer || raw.user,
    service: raw.service,
  };
}

export function useAppointments(statusFilter?: string) {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await appointmentsApi.getAppointments({ status: statusFilter });
      let list: any[] = [];
      if (Array.isArray(res.data)) {
        list = res.data;
      } else if (res.data && Array.isArray((res.data as any).appointments)) {
        list = (res.data as any).appointments;
      } else if (res.data && Array.isArray((res.data as any).data)) {
        list = (res.data as any).data;
      } else if (Array.isArray(res as any)) {
        list = res as any;
      }

      const normalized = list.map(normalizeAppointment);
      setAppointments(normalized);
    } catch (err: any) {
      console.warn('Failed to fetch actual appointments:', err.message);
      setError(err?.message || 'Failed to load appointments');
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
    return res.data ? normalizeAppointment(res.data) : null;
  };

  const cancelAppointment = async (id: string, reason?: string) => {
    await appointmentsApi.cancelAppointment(id, reason);
    await fetchAppointments();
  };

  const updateStatus = async (id: string, newStatus: string) => {
    await appointmentsApi.updateAppointmentStatus(id, newStatus);
    await fetchAppointments();
  };

  const rescheduleAppointment = async (
    id: string,
    payload: { date?: string; time?: string; appointmentDate?: string; appointmentTime?: string; notes?: string }
  ) => {
    await appointmentsApi.rescheduleAppointment(id, payload);
    await fetchAppointments();
  };

  return {
    appointments,
    isLoading,
    isRefreshing,
    error,
    refresh,
    createAppointment,
    cancelAppointment,
    updateStatus,
    rescheduleAppointment,
  };
}

export function useAppointmentDetails(appointmentId?: string) {
  const [appointment, setAppointment] = useState<AppointmentItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointment = useCallback(async () => {
    if (!appointmentId) {
      setAppointment(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await appointmentsApi.getAppointmentById(appointmentId);
      if (res.data) {
        setAppointment(normalizeAppointment(res.data));
      } else {
        setAppointment(null);
      }
    } catch (err: any) {
      console.warn(`Failed to fetch appointment details for ${appointmentId}:`, err.message);
      setError(err?.message || 'Appointment not found');
      setAppointment(null);
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  const cancelAppointment = async (reason?: string) => {
    if (!appointmentId) return;
    await appointmentsApi.cancelAppointment(appointmentId, reason);
    await fetchAppointment();
  };

  const updateStatus = async (newStatus: string) => {
    if (!appointmentId) return;
    await appointmentsApi.updateAppointmentStatus(appointmentId, newStatus);
    await fetchAppointment();
  };

  const rescheduleAppointment = async (payload: {
    date?: string;
    time?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    notes?: string;
  }) => {
    if (!appointmentId) return;
    await appointmentsApi.rescheduleAppointment(appointmentId, payload);
    await fetchAppointment();
  };

  return {
    appointment,
    isLoading,
    error,
    cancelAppointment,
    updateStatus,
    rescheduleAppointment,
    refetch: fetchAppointment,
  };
}


