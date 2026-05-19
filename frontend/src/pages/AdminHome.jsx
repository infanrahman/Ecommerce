import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminHome = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        orders: 0,
        users: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [prodRes, catRes, ordRes, userRes] = await Promise.all([
                    axios.get('/api/products/', config),
                    axios.get('/api/categories/', config),
                    axios.get('/api/orders/', config),
                    axios.get('/api/users/', config)
                ]);

                setStats({
                    products: prodRes.data.length,
                    categories: catRes.data.length,
                    orders: ordRes.data.length,
                    users: userRes.data.length
                });
            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchStats();
        }
    }, [token]);

    if (loading) return <div className="page-container">Loading stats...</div>;

    return (
        <div>
            <header className="page-header">
                <h1>Dashboard Overview</h1>
                <p style={{ color: 'var(--text-muted)' }}>Welcome back to the administrator panel. Here's a snapshot of your store.</p>
            </header>

            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <h3>Products</h3>
                    <div className="value">{stats.products}</div>
                </div>
                <div className="admin-stat-card users">
                    <h3>Categories</h3>
                    <div className="value">{stats.categories}</div>
                </div>
                <div className="admin-stat-card orders">
                    <h3>Orders</h3>
                    <div className="value">{stats.orders}</div>
                </div>
                <div className="admin-stat-card users">
                    <h3>Registered Users</h3>
                    <div className="value">{stats.users}</div>
                </div>
            </div>

            <div className="cart-summary" style={{ marginTop: '2rem' }}>
                <h3>Quick Actions</h3>
                <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>Use the sidebar navigation to manage products, categories, orders, and system users.</p>
            </div>
        </div>
    );
};

export default AdminHome;
