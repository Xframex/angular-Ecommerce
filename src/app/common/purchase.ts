import { Address } from "./address";
import { Customer } from "./customer";
import { OrderItem } from "./order-item";

export class Purchase {

    customer: Customer;
    shippingAddress: Address;
    billingAddress: Address;
    orderItems: OrderItem[];

    constructor(customer: Customer, 
               shippingAddress: Address, 
               billingAddress: Address, 
               orderItems: OrderItem[]) {
        this.customer = customer;
        this.shippingAddress = shippingAddress;
        this.billingAddress = billingAddress;
        this.orderItems = orderItems;
    }
}
