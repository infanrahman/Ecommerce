import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const Checkout = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const orderData = {
                customer_name: formData.name,
                customer_email: formData.email,
                total_price: cartTotal.toFixed(2),
                status: 'Paid', // mocked
                items: cart.map(item => ({
                    product: item.product.id,
                    quantity: item.quantity,
                    price: item.product.price
                }))
            };
            await axios.post('/api/orders/', orderData);
            clearCart();
            setSuccess(true);
        } catch (error) {
            console.error("Checkout failed", error);
            alert("Checkout failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="page-container success-page">
                <h2>Payment Successful!</h2>
                <p>Thank you for your order, {formData.name}.</p>
                <button onClick={() => navigate('/')} className="btn-primary mt-4">Return Home</button>
            </div>
        );
    }

    if (cart.length === 0) return <div className="page-container">Your cart is empty.</div>;

    return (
        <div className="page-container checkout-container">
            <h2>Checkout</h2>
            <div className="checkout-grid">
                <form className="checkout-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    
                    <div className="mock-payment">
                        <h3>Payment Information</h3>
                        <p className="text-muted">This is a demo. No real card needed.</p>
                        <input type="text" placeholder="Card Number (Mock)" disabled />
                    </div>
                    
                    <button type="submit" className="btn-primary large w-full" disabled={loading}>
                        {loading ? 'Processing...' : `Pay $${cartTotal.toFixed(2)}`}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
