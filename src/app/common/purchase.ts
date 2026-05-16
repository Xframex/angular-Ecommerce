import { Address } from "./address";
import { Customer } from "./customer";
import { Order } from "./order";
import { OrderItem } from "./order-item";

export class Purchase {

  customer!: Customer;
  shippingAddress!: Address;
  billingAddress!: Address;
  orderItems!: OrderItem[];
  order!: Order;
  paymentIntentId?: string;
}
