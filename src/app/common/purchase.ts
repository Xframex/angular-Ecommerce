import { Address } from "./address";
import { Customer } from "./customer";
import { OrderItem } from "./order-item";

export class Purchase {

  customer!: Customer;
  shippingAddress!: Address;
  billingAddress!: Address;
  orderItems!: OrderItem[];
}
