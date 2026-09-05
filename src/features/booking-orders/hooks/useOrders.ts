import { useState, useEffect, useCallback } from 'react';
import { ordersApi, CreateOrderPayload } from '../../../api/orders.api';
import { OrderItem } from '../../../types/api';

const DEFAULT_ORDERS: OrderItem[] = [
  {
    id: '1',
    orderNumber: '#SD-8492',
    status: 'In Progress',
    itemName: 'Silk Anarkali Suit',
    tailorName: 'Rekha Tailors',
    deliveryDate: 'Expected Oct 24',
    price: 4500,
    image: require('@/assets/illustrations/customer-tabs/orders/anarkali.png'),
    timeline: [
      { status: 'Order Placed', date: 'Oct 12, 2026', completed: true },
      { status: 'Fabric Received', date: 'Oct 14, 2026', completed: true },
      { status: 'Stitching in Progress', date: 'Oct 18, 2026', completed: true },
      { status: 'Quality Check', date: 'Oct 22, 2026', completed: false },
      { status: 'Ready for Delivery', date: 'Oct 24, 2026', completed: false },
    ],
  },
  {
    id: '2',
    orderNumber: '#SD-8420',
    status: 'Confirmed',
    itemName: 'Custom Tuxedo Suit',
    tailorName: 'Stitch Craft',
    deliveryDate: 'Expected Nov 02',
    price: 8200,
    image: require('@/assets/illustrations/customer-tabs/orders/tuxedo.png'),
    timeline: [
      { status: 'Order Placed', date: 'Oct 15, 2026', completed: true },
      { status: 'Confirmed by Tailor', date: 'Oct 16, 2026', completed: true },
      { status: 'Stitching in Progress', date: 'Oct 25, 2026', completed: false },
      { status: 'Ready for Delivery', date: 'Nov 02, 2026', completed: false },
    ],
  },
];

export function useOrders(statusFilter?: string) {
  const [orders, setOrders] = useState<OrderItem[]>(DEFAULT_ORDERS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ordersApi.getMyOrders().catch(() => ordersApi.getOrders({ status: statusFilter }));
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setOrders(res.data);
      } else {
        setOrders(DEFAULT_ORDERS);
      }
    } catch (err: any) {
      console.warn('Failed to load orders from backend, using fallback:', err.message);
      setError(err.message || 'Failed to load orders');
      setOrders(DEFAULT_ORDERS);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
          if (res.data) {
            setOrder(res.data);
          } else {
            const fallback = DEFAULT_ORDERS.find((o) => o.id === orderId || o.orderNumber === orderId) || DEFAULT_ORDERS[0];
            setOrder(fallback);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          const fallback = DEFAULT_ORDERS.find((o) => o.id === orderId || o.orderNumber === orderId) || DEFAULT_ORDERS[0];
          setOrder(fallback);
          setError(err.message);
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
