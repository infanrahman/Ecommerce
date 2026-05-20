import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const { isAuthenticated, user, login } = useAuth();
    const navigate = useNavigate();

    // Checkout Form state
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Auth / Registration Mode inside Checkout
    const [isRegisterMode, setIsRegisterMode] = useState(true); // true = Register, false = Login
    const [authFields, setAuthFields] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    // Pre-fill fields if user is already authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            setFormData({
                name: user.username || '',
                email: user.email || ''
            });
        }
    }, [isAuthenticated, user]);

    // Handle Registration / Login submission
    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setAuthError('');
        setAuthLoading(true);

        try {
            if (isRegisterMode) {
                // Register Flow
                if (authFields.password !== authFields.confirmPassword) {
                    setAuthError("Passwords do not match.");
                    setAuthLoading(false);
                    return;
                }

                const res = await axios.post('/api/register/', {
                    username: authFields.username,
                    email: authFields.email,
                    password: authFields.password
                });

                // Set token and log user in immediately
                await login(res.data.access);
            } else {
                // Login Flow
                const res = await axios.post('/api/token/', {
                    username: authFields.username,
                    password: authFields.password
                });

                await login(res.data.access);
            }
        } catch (err) {
            console.error("Authentication failed during checkout", err);
            if (err.response && err.response.data) {
                const data = err.response.data;
                if (typeof data === 'object') {
                    // Extract first error message
                    const firstKey = Object.keys(data)[0];
                    const firstVal = data[firstKey];
                    setAuthError(`${firstKey}: ${Array.isArray(firstVal) ? firstVal[0] : JSON.stringify(firstVal)}`);
                } else {
                    setAuthError("Authentication failed. Please check your credentials.");
                }
            } else {
                setAuthError("Network error. Please try again.");
            }
        } finally {
            setAuthLoading(false);
        }
    };

    // Handle Order submission
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
            <div className="page-container success-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
                <div style={{ background: '#ecfdf5', color: '#10b981', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem', fontSize: '2rem' }}>✓</div>
                <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Payment Successful!</h2>
                <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Thank you for your order, <strong>{formData.name}</strong>. Your payment was processed successfully.</p>
                <button onClick={() => navigate('/')} className="btn-primary">Return Home</button>
            </div>
        );
    }

    if (cart.length === 0) return <div className="page-container" style={{ textAlign: 'center', padding: '3rem' }}>Your cart is empty.</div>;

    return (
        <div className="page-container checkout-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '2rem', textAlign: 'center' }}>Checkout</h2>
            
            {!isAuthenticated ? (
                <div className="checkout-form" style={{ maxWidth: '480px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <button 
                            type="button" 
                            onClick={() => { setIsRegisterMode(true); setAuthError(''); }}
                            style={{ 
                                flex: 1, 
                                padding: '0.75rem', 
                                border: 'none', 
                                borderBottom: isRegisterMode ? '3px solid var(--accent)' : '3px solid transparent',
                                background: 'transparent',
                                fontWeight: 'bold',
                                color: isRegisterMode ? 'var(--accent)' : 'var(--text-light)',
                                cursor: 'pointer'
                            }}
                        >
                            Register New Account
                        </button>
                        <button 
                            type="button" 
                            onClick={() => { setIsRegisterMode(false); setAuthError(''); }}
                            style={{ 
                                flex: 1, 
                                padding: '0.75rem', 
                                border: 'none', 
                                borderBottom: !isRegisterMode ? '3px solid var(--accent)' : '3px solid transparent',
                                background: 'transparent',
                                fontWeight: 'bold',
                                color: !isRegisterMode ? 'var(--accent)' : 'var(--text-light)',
                                cursor: 'pointer'
                            }}
                        >
                            Log In to Account
                        </button>
                    </div>

                    <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                        {isRegisterMode ? 'Create account to continue' : 'Sign in to continue'}
                    </h3>

                    {authError && <p style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{authError}</p>}

                    <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="form-group">
                            <label>Username</label>
                            <input 
                                type="text" 
                                required 
                                value={authFields.username} 
                                onChange={e => setAuthFields({...authFields, username: e.target.value})} 
                            />
                        </div>

                        {isRegisterMode && (
                            <div className="form-group">
                                <label>Email Address</label>
                                <input 
                                    type="email" 
                                    required 
                                    value={authFields.email} 
                                    onChange={e => setAuthFields({...authFields, email: e.target.value})} 
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Password</label>
                            <input 
                                type="password" 
                                required 
                                value={authFields.password} 
                                onChange={e => setAuthFields({...authFields, password: e.target.value})} 
                            />
                        </div>

                        {isRegisterMode && (
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input 
                                    type="password" 
                                    required 
                                    value={authFields.confirmPassword} 
                                    onChange={e => setAuthFields({...authFields, confirmPassword: e.target.value})} 
                                />
                            </div>
                        )}

                        <button type="submit" className="btn-primary w-full" disabled={authLoading}>
                            {authLoading ? 'Verifying...' : isRegisterMode ? 'Register & Checkout' : 'Login & Checkout'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="checkout-grid" style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
                        <span>Logged in as <strong>{user?.username}</strong></span>
                        <button onClick={() => navigate('/cart')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 'bold' }}>Modify Cart</button>
                    </div>

                    <form className="checkout-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                required 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                required 
                                value={formData.email} 
                                onChange={e => setFormData({...formData, email: e.target.value})} 
                            />
                        </div>
                        
                        <div className="mock-payment" style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Payment Information</h3>
                            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#6b7280' }}>This is a demo. No real card is required.</p>
                            <input 
                                type="text" 
                                placeholder="4111 2222 3333 4444 (Mocked)" 
                                disabled 
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', background: '#f3f4f6' }}
                            />
                        </div>
                        
                        <button type="submit" className="btn-primary large w-full" disabled={loading} style={{ padding: '1rem', fontSize: '1.1rem' }}>
                            {loading ? 'Processing...' : `Pay $${cartTotal.toFixed(2)}`}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Checkout;
