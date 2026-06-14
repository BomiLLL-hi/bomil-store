export type Language = 'ru' | 'en'
export type Currency = 'rub' | 'usd'

export type StockStatus = 'in_stock' | 'sold_out'
export type ProductCategory = 'godly' | 'chroma' | 'vintage' | 'set' | 'pet'
export type ProductType = 'knife' | 'gun' | 'pet' | 'other'

export interface Product {
  id: string
  title: string
  slug: string
  aliases: string[]
  description: string
  images: string[]
  category: ProductCategory
  type: ProductType
  stock_status: StockStatus
  current_price: number
  old_price: number | null
  hidden_status: boolean
  is_set: boolean
  is_best_of_all_time: boolean
  extra_categories: string[]
  included_items: string[]
  created_at: string
  updated_at: string
}

export type CatalogCategory = 'all' | ProductCategory | 'best'
export type SortOption = '' | 'price_asc' | 'price_desc'
export type TypeFilter = '' | 'knife' | 'gun'

export interface CartItem {
  product: Product
  quantity: number
}

export interface OrderItem {
  product_id: string
  title: string
  slug: string
  image: string | null
  price_rub: number
  quantity: number
}

export type OrderStatus = 'pending' | 'paid' | 'delivered' | 'refunded' | 'cancelled'

export interface Order {
  id: string
  order_number: string
  user_id: string | null
  email: string
  roblox_username: string
  roblox_user_id: number
  items: OrderItem[]
  total_rub: number
  status: OrderStatus
  payment_provider: string | null
  payment_id: string | null
  payment_url: string | null
  created_at: string
  updated_at: string
  paid_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
}

export interface ChatSession {
  id: string
  user_id: string | null
  status: 'active' | 'closed'
  type: 'order' | 'question' | null
  order_id: string | null
  ticket_number: string | null
  operator_id: string | null
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  sender_type: 'user' | 'bot' | 'operator'
  content: string
  created_at: string
  telegram_message_id?: number | null
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export interface Review {
  id: string
  user_id: string
  order_id: string
  product_id: string
  rating: number
  text: string
  status: ReviewStatus
  created_at: string
  username?: string | null
}

export interface FaqItem {
  id: string
  question_ru: string
  question_en: string
  answer_ru: string
  answer_en: string
  sort_order: number
  created_at: string
}

export interface UserProfile {
  id: string
  username: string | null
  roblox_username: string | null
  role: 'user' | 'operator' | 'admin'
  created_at: string
}
