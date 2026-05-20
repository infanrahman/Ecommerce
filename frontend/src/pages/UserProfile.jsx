import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LogOut, Package, User } from 'lucide-react';

const UserProfile = () => {
    const { user, isAuthenticated, logout, token } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }

        const fetchOrders = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const response = await axios.get('/api/orders/', config);
                setOrders(response.data);
            } catch (error) {
                console.error("Failed to fetch order history", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [isAuthenticated, token, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return <div className="page-container text-center p-3">Loading profile...</div>;

    return (
        <div className="page-container max-w-800">
            <header className="page-header flex-row-responsive justify-between" style={{ alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User className="icon" /> My Profile
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your details and view order history.</p>
                </div>
                <button onClick={handleLogout} className="btn-outline flex-center gap-1" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                    <LogOut size={18} /> Logout
                </button>
            </header>

            <div className="checkout-grid" style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Account Details</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Username</p>
                        <p style={{ fontWeight: '500' }}>{user.username}</p>
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Email</p>
                        <p style={{ fontWeight: '500' }}>{user.email}</p>
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>First Name</p>
                        <p style={{ fontWeight: '500' }}>{user.first_name || 'N/A'}</p>
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Last Name</p>
                        <p style={{ fontWeight: '500' }}>{user.last_name || 'N/A'}</p>
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Member Since</p>
                        <p style={{ fontWeight: '500' }}>{new Date(user.date_joined).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            <div className="checkout-grid" style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Package size={20} /> Order History
                </h3>
                
                {loading ? (
                    <p>Loading orders...</p>
                ) : orders.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {orders.map(order => (
                            <div key={order.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
                                <div className="flex-row-responsive justify-between" style={{ marginBottom: '1rem', borderBottom: '1px dashed var(--border)', paddingBottom: '1rem' }}>
                                    <div>
                                        <p style={{ fontWeight: 'bold' }}>Order #{order.id}</p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(order.created_at).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p style={{ fontWeight: 'bold', color: 'var(--primary)' }}>${order.total_price}</p>
                                        <p style={{ display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: order.status === 'Paid' ? '#dcfce7' : '#fef3c7', color: order.status === 'Paid' ? '#15803d' : '#d97706' }}>
                                            {order.status}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Items:</h4>
                                    <ul style={{ listStyleType: 'none', padding: '0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {order.items.map((item, idx) => (
                                            <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                                <span>{item.quantity}x Product ID: {item.product}</span>
                                                <span>${item.price}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>You haven't placed any orders yet.</p>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
