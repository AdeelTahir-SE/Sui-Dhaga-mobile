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
  address?: string;
  city?: string;
  avatarUrl?: string;
  avatar_url?: string;
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
  avatarUrl?: string;
  banner?: string;
  bannerUrl?: string;
  isVerified?: boolean;
  verified?: boolean;
  isTopRated?: boolean;
  topRated?: boolean;
  hourlyRate?: number;
  startingPrice?: number;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
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
  verification_status?: string;
  review_count?: number;
  banner_url?: string;
  profile?: {
    id?: string;
    fullName?: string;
    full_name?: string;
    phone?: string;
    avatarUrl?: string;
    avatar_url?: string;
    address?: string;
    name?: string;
  };
}

export interface OrderItem {
  id: string;
  orderNumber?: string;
  customerId?: string;
  customer_id?: string;
  tailorId?: string;
  tailor_id?: string;
  status: 'Pending' | 'In Progress' | 'Confirmed' | 'Completed' | 'Cancelled';
  itemName: string;
  item_name?: string;
  tailorName?: string;
  customerName?: string;
  customer_name?: string;
  customerPhone?: string;
  customer_phone?: string;
  customerAvatar?: string;
  customer_avatar?: string;
  customerAddress?: string;
  customer_address?: string;
  customerCity?: string;
  customer_city?: string;
  customer?: {
    id?: string;
    fullName?: string;
    full_name?: string;
    name?: string;
    phone?: string;
    avatarUrl?: string;
    avatar_url?: string;
    address?: string;
    city?: string;
  };
  tailorAvatar?: string;
  tailor_avatar?: string;
  tailorPhone?: string;
  tailor_phone?: string;
  tailorCity?: string;
  tailor_city?: string;
  tailorSpecialty?: string;
  tailor_specialty?: string;
  tailorSpecialties?: string[];
  tailorRating?: number;
  tailor_rating?: number;
  tailorReviewCount?: number;
  tailor_review_count?: number;
  tailorShopName?: string;
  tailor_shop_name?: string;
  tailorVerified?: boolean;
  tailor_verified?: boolean;
  tailor?: {
    id?: string;
    userId?: string;
    user_id?: string;
    shopName?: string;
    shop_name?: string;
    name?: string;
    city?: string;
    address?: string;
    rating?: number;
    reviewCount?: number;
    review_count?: number;
    bannerUrl?: string;
    banner_url?: string;
    specialties?: string[];
    verified?: boolean;
    phone?: string;
    profile?: {
      id?: string;
      fullName?: string;
      full_name?: string;
      phone?: string;
      avatarUrl?: string;
      avatar_url?: string;
      address?: string;
    };
  };
  deliveryDate?: string;
  delivery_date?: string;
  dueDate?: string;
  price: number;
  totalAmount?: number;
  total_amount?: number;
  imageUrl?: string;
  image?: string;
  notes?: string;
  additionalNotes?: string;
  additional_notes?: string;
  designImages?: string[];
  design_images?: string[];
  measurements?: Record<string, any>;
  measurementsId?: string;
  measurement_id?: string;
  timeline?: {
    status: string;
    date: string;
    completed: boolean;
  }[];
  createdAt?: string;
  created_at?: string;
}

export interface AppointmentItem {
  id: string;
  tailorId?: string;
  tailor_id?: string;
  customerId?: string;
  customer_id?: string;
  serviceId?: string;
  service_id?: string;
  customerName?: string;
  customer_name?: string;
  customerAvatar?: string;
  customer_avatar?: string;
  clientName?: string;
  clientAvatar?: string;
  userName?: string;
  tailorName?: string;
  tailor_name?: string;
  tailorAvatar?: string;
  tailor_avatar?: string;
  serviceType?: string;
  service_type?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  appointment_date?: string;
  appointment_time?: string;
  date?: string;
  time?: string;
  status: 'Pending' | 'Upcoming' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rejected' | string;
  notes?: string;
  location?: string;
  price?: number;
  duration?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  tailor?: any;
  customer?: any;
  service?: any;
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
  _id?: string;
  userId?: string;
  user_id?: string;
  name?: string;
  fullName?: string;
  full_name?: string;
  shopName?: string;
  shop_name?: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
  avatar_url?: string;
  avatar?: string;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  conversation_id?: string;
  senderId?: string;
  sender_id?: string;
  senderName?: string;
  senderAvatar?: string;
  text: string;
  attachments?: string[];
  isRead?: boolean;
  is_read?: boolean;
  readAt?: string;
  read_at?: string;
  createdAt: string;
  created_at?: string;
}

export interface ConversationItem {
  id: string;
  tailorId?: string;
  tailor_id?: string;
  customerId?: string;
  customer_id?: string;
  userId?: string;
  user_id?: string;
  participantId?: string;
  participant_id?: string;
  participant1_id?: string;
  participant2_id?: string;
  participant?: ConversationParticipant;
  participant1?: ConversationParticipant;
  participant2?: ConversationParticipant;
  participants?: ConversationParticipant[];
  lastMessage?: string | { text: string; createdAt: string; isRead?: boolean };
  last_message?: string | { text: string; createdAt: string; isRead?: boolean };
  lastMessageAt?: string;
  last_message_at?: string;
  unreadCount?: number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface CommunityAuthor {
  id: string;
  name?: string;
  fullName?: string;
  full_name?: string;
  avatarUrl?: string;
  avatar_url?: string;
  avatar?: string;
  role?: string;
  isVerified?: boolean;
}

export interface CommunityComment {
  id: string;
  postId?: string;
  post_id?: string;
  userId?: string;
  user_id?: string;
  content: string;
  createdAt: string;
  created_at?: string;
  user?: CommunityAuthor;
}

export interface CommunityPost {
  id: string;
  userId?: string;
  user_id?: string;
  title?: string;
  content?: string;
  caption?: string;
  images?: string[];
  tags?: string[];
  category?: string;
  likesCount?: number;
  likes_count?: number;
  savesCount?: number;
  saves_count?: number;
  commentsCount?: number;
  comments_count?: number;
  isLiked?: boolean;
  is_liked?: boolean;
  isSaved?: boolean;
  is_saved?: boolean;
  author?: CommunityAuthor;
  comments?: CommunityComment[];
  createdAt: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface CreateCommunityPostPayload {
  title?: string;
  content?: string;
  caption?: string;
  category?: string;
  tags?: string[] | string;
  images?: string[];
}
