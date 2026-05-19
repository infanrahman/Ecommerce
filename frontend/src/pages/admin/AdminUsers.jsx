import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AdminUsers = () => {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); // Null for create, user object for edit

    // Form fields
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isStaff, setIsStaff] = useState(false);
    const [isSuperuser, setIsSuperuser] = useState(false);
    const [isActive, setIsActive] = useState(true);

    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/users/', config);
            setUsers(res.data);
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUsers().finally(() => setLoading(false));
        }
    }, [token]);

    const openCreateModal = () => {
        setCurrentUser(null);
        setUsername('');
        setEmail('');
        setPassword('');
        setIsStaff(false);
        setIsSuperuser(false);
        setIsActive(true);
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setCurrentUser(user);
        setUsername(user.username);
        setEmail(user.email || '');
        setPassword(''); // Always empty on edit unless reset
        setIsStaff(user.is_staff);
        setIsSuperuser(user.is_superuser);
        setIsActive(user.is_active);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await axios.delete(`/api/users/${id}/`, config);
                fetchUsers();
            } catch (error) {
                console.error("Error deleting user", error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const payload = {
            username,
            email,
            is_staff: isStaff,
            is_superuser: isSuperuser,
            is_active: isActive
        };

        if (password) {
            payload.password = password;
        }

        try {
            if (currentUser) {
                await axios.put(`/api/users/${currentUser.id}/`, payload, config);
            } else {
                if (!password) {
                    alert("Password is required for new users.");
                    return;
                }
                await axios.post('/api/users/', payload, config);
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (error) {
            console.error("Error saving user", error);
            alert("Error saving user. Username may already exist.");
        }
    };

    if (loading) return <div className="page-container">Loading users...</div>;

    return (
        <div>
            <header className="page-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Manage Users</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Administer users, permissions, and status.</p>
                </div>
                <button onClick={openCreateModal} className="btn-primary">Add User</button>
            </header>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Staff</th>
                            <th>Superuser</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td><strong>{user.username}</strong></td>
                                <td>{user.email || '-'}</td>
                                <td>
                                    <span className={`badge ${user.is_staff ? 'badge-staff' : 'badge-inactive'}`}>
                                        {user.is_staff ? 'Staff' : 'No'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${user.is_superuser ? 'badge-superuser' : 'badge-inactive'}`}>
                                        {user.is_superuser ? 'Superuser' : 'No'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${user.is_active ? 'badge-active' : 'badge-inactive'}`}>
                                        {user.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                                <td>
                                    <div className="table-actions">
                                        <button onClick={() => openEditModal(user)} className="btn-edit">Edit</button>
                                        <button onClick={() => handleDelete(user.id)} className="btn-delete">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Dialog */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{currentUser ? 'Edit User' : 'Add New User'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="modal-close">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Username</label>
                                <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>{currentUser ? 'Password (leave blank to keep unchanged)' : 'Password'}</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required={!currentUser} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={isStaff} onChange={e => setIsStaff(e.target.checked)} />
                                    Staff Status (Can access Admin API)
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={isSuperuser} onChange={e => setIsSuperuser(e.target.checked)} />
                                    Superuser Status (Has all permissions)
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                                    Active (Can log in)
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline">Cancel</button>
                                <button type="submit" className="btn-primary">Save User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
