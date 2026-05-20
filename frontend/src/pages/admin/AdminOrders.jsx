import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AdminOrders = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null); // For viewing order details modal

    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/api/orders/', config);
            setOrders(res.data);
        } catch (error) {
            console.error("Error fetching orders", error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchOrders().finally(() => setLoading(false));
        }
    }, [token]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await axios.patch(`/api/orders/${orderId}/`, { status: newStatus }, config);
            fetchOrders();
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            console.error("Error updating order status", error);
            alert("Error updating order status.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this order?")) {
            try {
                await axios.delete(`/api/orders/${id}/`, config);
                fetchOrders();
                setSelectedOrder(null);
            } catch (error) {
                console.error("Error deleting order", error);
            }
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Paid':
                return { backgroundColor: '#dcfce7', color: '#15803d' };
            case 'Shipped':
                return { backgroundColor: '#e0f2fe', color: '#0369a1' };
            case 'Pending':
            default:
                return { backgroundColor: '#fef3c7', color: '#d97706' };
        }
    };

    if (loading) return <div className="page-container">Loading orders...</div>;

    return (
        <div>
            <header className="page-header">
                <h1>Manage Orders</h1>
                <p style={{ color: 'var(--text-muted)' }}>Review customer purchases and update order fulfillment statuses.</p>
            </header>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer Name</th>
                            <th>Customer Email</th>
                            <th>Total Price</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td data-label="Order ID">#{order.id}</td>
                                <td data-label="Customer"><strong>{order.customer_name}</strong></td>
                                <td data-label="Email">{order.customer_email}</td>
                                <td data-label="Total">${order.total_price}</td>
                                <td data-label="Status">
                                    <span className="badge" style={getStatusStyle(order.status)}>
                                        {order.status}
                                    </span>
                                </td>
                                <td data-label="Date">{new Date(order.created_at).toLocaleDateString()}</td>
                                <td data-label="Actions">
                                    <div className="table-actions">
                                        <button onClick={() => setSelectedOrder(order)} className="btn-edit">View</button>
                                        <select 
                                            value={order.status} 
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            style={{ padding: '0.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Paid">Paid</option>
                                            <option value="Shipped">Shipped</option>
                                        </select>
                                        <button onClick={() => handleDelete(order.id)} className="btn-delete">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* View Details Modal */}
            {selectedOrder && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>Order Details #{selectedOrder.id}</h2>
                            <button onClick={() => setSelectedOrder(null)} className="modal-close">&times;</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <p><strong>Customer:</strong> {selectedOrder.customer_name} ({selectedOrder.customer_email})</p>
                                <p><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                                <p><strong>Status: </strong> 
                                    <span className="badge" style={getStatusStyle(selectedOrder.status)}>
                                        {selectedOrder.status}
                                    </span>
                                </p>
                            </div>

                            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginTop: '1rem' }}>Items Ordered</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                                        <span>Product ID: {item.product} (x{item.quantity})</span>
                                        <strong>${(parseFloat(item.price) * item.quantity).toFixed(2)}</strong>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--border)', paddingTop: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                    <span>Total:</span>
                                    <span>${selectedOrder.total_price}</span>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setSelectedOrder(null)} className="btn-primary">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
