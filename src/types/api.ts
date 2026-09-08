export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

export type UserRole = 'customer' | 'tailor' | 'designer' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  name?: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  avatar?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSession {
  accessToken?: string;
  token?: string;
  access_token?: string;
  jwt?: string;
  refreshToken?: string;
  refresh_token?: string;
  expiresIn?: number;
  expires_in?: number;
  user?: User;
}

export interface TailorServiceItem {
  id?: string;
  title: string;
  price: number;
  description?: string;
  category?: string;
}

export interface TailorItem {
  id: string;
  userId?: string;
  name: string;
  shopName?: string;
  businessName?: string;
  rating: number;
  reviewsCount?: number;
  reviews?: number;
  distance?: string;
  specialty?: string;
  specialties?: string[];
  imageUrl?: string;
  image?: string;
  avatar?: string;
  isVerified?: boolean;
  verified?: boolean;
  isTopRated?: boolean;
  topRated?: boolean;
  hourlyRate?: number;
  startingPrice?: number;
  city?: string;
  address?: string;
  location?: {
    address?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  bio?: string;
  experienceYears?: number;
  completedOrders?: number;
  phone?: string;
  isProfileComplete?: boolean;
  services?: TailorServiceItem[];
  gallery?: ({ id?: string; imageUrl: string; caption?: string } | string)[];
}

export interface OrderItem {
  id: string;
  orderNumber?: string;
  customerId?: string;
  tailorId?: string;
  status: 'Pending' | 'In Progress' | 'Confirmed' | 'Completed' | 'Cancelled';
  itemName: string;
  tailorName?: string;
  customerName?: string;
  deliveryDate?: string;
  dueDate?: string;
  price: number;
  imageUrl?: string;
  image?: string;
  notes?: string;
  measurementsId?: string;
  timeline?: {
    status: string;
    date: string;
    completed: boolean;
  }[];
  createdAt?: string;
}

export interface AppointmentItem {
  id: string;
  tailorId?: string;
  customerId?: string;
  customerName?: string;
  customerAvatar?: string;
  clientName?: string;
  clientAvatar?: string;
  userName?: string;
  tailorName?: string;
  tailorAvatar?: string;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'Pending' | 'Upcoming' | 'Confirmed' | 'Completed' | 'Cancelled' | string;
  notes?: string;
  location?: string;
  price?: number;
  createdAt?: string;
}

export interface DesignItem {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  imageUrl: string;
  image?: string;
  category?: string;
  garmentType?: string;
  fabric?: string;
  color?: string;
  tags?: string[];
  createdAt?: string;
}

export interface MeasurementItem {
  id: string;
  userId?: string;
  profileName: string;
  gender?: 'male' | 'female' | 'other';
  unit?: 'inches' | 'cm';
  chest?: number;
  waist?: number;
  hips?: number;
  shoulder?: number;
  sleeveLength?: number;
  shirtLength?: number;
  trouserLength?: number;
  inseam?: number;
  neck?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'appointment' | 'message' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface ConversationParticipant {
  id: string;
  name?: string;
  fullName?: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
  avatar?: string;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  text: string;
  attachments?: string[];
  isRead?: boolean;
  createdAt: string;
}

export interface ConversationItem {
  id: string;
  participantId?: string;
  participant?: ConversationParticipant;
  participants?: ConversationParticipant[];
  lastMessage?: string | { text: string; createdAt: string; isRead?: boolean };
  lastMessageAt?: string;
  unreadCount?: number;
  createdAt?: string;
  updatedAt?: string;
}
