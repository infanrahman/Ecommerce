import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2 } from 'lucide-react';

const Cart = () => {
    const { cart, removeFromCart, cartTotal } = useCart();

    if (cart.length === 0) {
        return (
            <div className="page-container empty-cart">
                <h2>Your Cart is Empty</h2>
                <Link to="/" className="btn-primary mt-4">Continue Shopping</Link>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h2>Shopping Cart</h2>
            <div className="cart-content">
                <div className="cart-items">
                    {cart.map(item => (
                        <div key={item.product.id} className="cart-item">
                            {item.product.image ? (
                                <img src={item.product.image} alt={item.product.name} className="cart-item-image" />
                            ) : (
                                <div className="cart-item-placeholder">No Img</div>
                            )}
                            <div className="cart-item-details">
                                <h4>{item.product.name}</h4>
                                <p>${item.product.price}</p>
                            </div>
                            <div className="cart-item-quantity">
                                Qty: {item.quantity}
                            </div>
                            <button onClick={() => removeFromCart(item.product.id)} className="btn-icon danger">
                                <Trash2 className="icon" />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="cart-summary">
                    <h3>Order Summary</h3>
                    <div className="summary-row">
                        <span>Total:</span>
                        <span className="total-price">${cartTotal.toFixed(2)}</span>
                    </div>
                    <Link to="/checkout" className="btn-primary w-full">Proceed to Checkout</Link>
                </div>
            </div>
        </div>
    );
};

export default Cart;
