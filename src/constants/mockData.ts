// ── Types ──────────────────────────────────────────────────────────────────

export type Tailor = {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  distance: string;
  specialty: string;
  image: string;
  verified: boolean;
  topRated: boolean;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: 'In Progress' | 'Confirmed' | 'Completed' | 'Cancelled';
  itemName: string;
  tailorName: string;
  deliveryDate: string;
  price: number;
  image: string;
};

export type Message = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
};

export type Category = {
  id: string;
  name: string;
  image: string;
};

export type Design = {
  id: string;
  image: string;
  name: string;
};

export type QuickAction = {
  id: string;
  icon: string;
  label: string;
};

// ── Mock Data ──────────────────────────────────────────────────────────────

export const tailors: Tailor[] = [
  {
    id: '1',
    name: 'Rekha Tailors',
    rating: 4.8,
    reviews: 138,
    distance: '2.1 km',
    specialty: 'Bridal, Suits',
    image: '',
    verified: true,
    topRated: true,
  },
  {
    id: '2',
    name: 'Stitch Craft',
    rating: 4.7,
    reviews: 96,
    distance: '3.4 km',
    specialty: "Men's Wear",
    image: '',
    verified: true,
    topRated: false,
  },
  {
    id: '3',
    name: 'Aarav Bespoke',
    rating: 4.6,
    reviews: 72,
    distance: '4.2 km',
    specialty: 'Indo-Western',
    image: '',
    verified: false,
    topRated: false,
  },
  {
    id: '4',
    name: 'Noor & Thread',
    rating: 4.5,
    reviews: 64,
    distance: '5.1 km',
    specialty: 'Sarees',
    image: '',
    verified: false,
    topRated: false,
  },
];

export const categories: Category[] = [
  { id: '1', name: 'Kurtas & Suits', image: '' },
  { id: '2', name: 'Lehengas', image: '' },
  { id: '3', name: 'Sarees', image: '' },
  { id: '4', name: 'Shirts', image: '' },
];

export const quickActions: QuickAction[] = [
  { id: '1', icon: 'calendar-outline', label: 'Book Appointment' },
  { id: '2', icon: 'color-palette-outline', label: 'AI Design Studio' },
  { id: '3', icon: 'receipt-outline', label: 'My Orders' },
  { id: '4', icon: 'sparkles-outline', label: 'Style Assistant' },
];

export const orders: Order[] = [
  {
    id: '1',
    orderNumber: '#SD1256',
    status: 'In Progress',
    itemName: 'Custom Anarkali Suit',
    tailorName: 'Rekha Tailors',
    deliveryDate: '25 May 2024',
    price: 12500,
    image: '',
  },
  {
    id: '2',
    orderNumber: '#SD1241',
    status: 'Confirmed',
    itemName: 'Kurta Set',
    tailorName: 'Stitch Craft',
    deliveryDate: '30 May 2024',
    price: 3200,
    image: '',
  },
  {
    id: '3',
    orderNumber: '#SD1230',
    status: 'In Progress',
    itemName: 'Lehenga',
    tailorName: 'Aarav Bespoke',
    deliveryDate: '28 May 2024',
    price: 18900,
    image: '',
  },
];

export const messages: Message[] = [
  {
    id: '1',
    name: 'Rekha Tailors',
    avatar: '',
    lastMessage: 'Your order #SD1256 is in progress...',
    time: '10:30 AM',
    unread: 2,
  },
  {
    id: '2',
    name: 'Stitch Craft',
    avatar: '',
    lastMessage: 'We have received your measurements.',
    time: '9:15 AM',
    unread: 1,
  },
  {
    id: '3',
    name: 'Aarav Bespoke',
    avatar: '',
    lastMessage: 'Can you share the reference image?',
    time: 'Yesterday',
    unread: 0,
  },
  {
    id: '4',
    name: 'Noor & Thread',
    avatar: '',
    lastMessage: 'Your appointment is confirmed.',
    time: 'Yesterday',
    unread: 0,
  },
  {
    id: '5',
    name: 'Ethnic Weaves',
    avatar: '',
    lastMessage: 'Thank you! 🙏',
    time: '2 May',
    unread: 0,
  },
  {
    id: '6',
    name: 'Pooja Mehta',
    avatar: '',
    lastMessage: 'Let me know if any changes...',
    time: '1 May',
    unread: 0,
  },
  {
    id: '7',
    name: 'Design Studio Team',
    avatar: '',
    lastMessage: 'Check out new templates!',
    time: '30 Apr',
    unread: 0,
  },
];

export const designs: Design[] = [
  { id: '1', image: '', name: 'Floral Anarkali' },
  { id: '2', image: '', name: 'Modern Kurta' },
  { id: '3', image: '', name: 'Classic Sherwani' },
  { id: '4', image: '', name: 'Embroidered Lehenga' },
  { id: '5', image: '', name: 'Silk Saree Blouse' },
  { id: '6', image: '', name: 'Indo-Western Jacket' },
];

export const templates: Design[] = [
  { id: '1', image: '', name: 'Summer Collection' },
  { id: '2', image: '', name: 'Festive Wear' },
  { id: '3', image: '', name: 'Casual Everyday' },
  { id: '4', image: '', name: 'Party Glam' },
  { id: '5', image: '', name: 'Office Formals' },
  { id: '6', image: '', name: 'Wedding Special' },
];
