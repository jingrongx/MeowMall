export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  shippingFee: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  refunds?: Refund[];
  address: Address;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string;
  };
}

export interface Refund {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
} 