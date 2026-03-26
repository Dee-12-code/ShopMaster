export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  address: Address;
  paymentMethod: string;
  date: string;
}

export interface Address {
  fullName: string;
  street: string;
  city: string;
  zipCode: string;
  country: string;
  phone: string;
}
