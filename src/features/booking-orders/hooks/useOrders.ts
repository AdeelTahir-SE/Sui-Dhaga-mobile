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

  return {
    orders,
    isLoading,
    isRefreshing,
    error,
    refresh,
    createOrder,
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

    ordersApi.getOrderById(orderId)
      .then((res) => {
        if (isMounted) {
          setOrder(res.data || null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setOrder(null);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  return { order, isLoading, error };
}
