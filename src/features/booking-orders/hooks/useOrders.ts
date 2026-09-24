import { useState, useEffect, useCallback } from 'react';
import { ordersApi, CreateOrderPayload } from '../../../api/orders.api';
import { OrderItem } from '../../../types/api';

export function useOrders(statusFilter?: string) {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ordersApi.getMyOrders().catch(() => ordersApi.getOrders({ status: statusFilter }));
      if (res.data && Array.isArray(res.data)) {
        setOrders(res.data);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      console.warn('Failed to load orders from backend:', err.message);
      setError(err.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setError(null);
    ordersApi.getMyOrders()
      .catch(() => ordersApi.getOrders({ status: statusFilter }))
      .then((res) => {
        if (isMounted) {
          if (res.data && Array.isArray(res.data)) {
            setOrders(res.data);
          } else {
            setOrders([]);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load orders');
          setOrders([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [statusFilter]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchOrders();
  }, [fetchOrders]);

  const createOrder = async (payload: CreateOrderPayload) => {
    const res = await ordersApi.createOrder(payload);
    await fetchOrders();
    return res;
  };

  const updateOrderStatus = async (orderId: string, status: OrderItem['status'] | string) => {
    const s = String(status || '').trim().toLowerCase().replace(/\s+/g, '_');
    const displayStatus: OrderItem['status'] =
      s === 'in_progress' || s === 'in progress' || s === 'accepted'
        ? 'In Progress'
        : s === 'completed' || s === 'done'
        ? 'Completed'
        : s === 'cancelled' || s === 'canceled' || s === 'declined' || s === 'rejected'
        ? 'Cancelled'
        : s === 'confirmed'
        ? 'Confirmed'
        : 'Pending';

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId || o.orderNumber === orderId) {
          return { ...o, status: displayStatus };
        }
        return o;
      })
    );

    try {
      await ordersApi.updateOrderStatus(orderId, status);
    } catch (err: any) {
      console.warn('Failed to update order status via API:', err.message);
    } finally {
      await fetchOrders();
    }
  };

  return {
    orders,
    isLoading,
    isRefreshing,
    error,
    refresh,
    createOrder,
    updateOrderStatus,
  };
}

export function useOrderDetails(orderId: string) {
  const [order, setOrder] = useState<OrderItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const fallbackSearch = async () => {
      try {
        const listRes = await ordersApi.getMyOrders().catch(() => ordersApi.getOrders());
        const found = (listRes.data || []).find(
          (o) => o.id === orderId || o.orderNumber === orderId
        );
        if (isMounted && found) {
          setOrder(found);
          setError(null);
          setIsLoading(false);
          return;
        }
      } catch {
        // ignore
      }
      if (isMounted) {
        setError('Order not found');
        setIsLoading(false);
      }
    };

    ordersApi.getOrderById(orderId)
      .then((res) => {
        if (isMounted) {
          if (res.data) {
            setOrder(res.data);
            setIsLoading(false);
          } else {
            fallbackSearch();
          }
        }
      })
      .catch(() => {
        fallbackSearch();
      });

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const updateOrderStatus = async (status: OrderItem['status'] | string) => {
    if (!orderId) return;
    const s = String(status || '').trim().toLowerCase().replace(/\s+/g, '_');
    const displayStatus: OrderItem['status'] =
      s === 'in_progress' || s === 'in progress' || s === 'accepted'
        ? 'In Progress'
        : s === 'completed' || s === 'done'
        ? 'Completed'
        : s === 'cancelled' || s === 'canceled' || s === 'declined' || s === 'rejected'
        ? 'Cancelled'
        : s === 'confirmed'
        ? 'Confirmed'
        : 'Pending';

    setOrder((prev) => (prev ? { ...prev, status: displayStatus } : null));
    try {
      await ordersApi.updateOrderStatus(orderId, status);
      const res = await ordersApi.getOrderById(orderId);
      if (res.data) {
        setOrder(res.data);
      }
    } catch (err: any) {
      console.warn('Failed to update order status:', err.message);
    }
  };

  return { order, isLoading, error, updateOrderStatus };
}
