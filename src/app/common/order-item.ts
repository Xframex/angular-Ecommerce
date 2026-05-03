import { CartItem } from "./cart-item";

export class OrderItem {

    imageUrl: string;
    unitPrice: number;
    quantity: number;
    productId: string;

    // OrderItem constructor that initializes the properties based 
    // on the CartItem object passed as an argument

    constructor(cartItem: CartItem) {
        this.imageUrl = cartItem.imageUrl;
        this.unitPrice = cartItem.unitPrice;
        this.quantity = cartItem.quantity;
        this.productId = cartItem.id;
    }
}
