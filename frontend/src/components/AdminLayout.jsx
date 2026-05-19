import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const navItems = [
        { path: '/admin', label: 'Dashboard' },
        { path: '/admin/products', label: 'Products' },
        { path: '/admin/categories', label: 'Categories' },
        { path: '/admin/orders', label: 'Orders' },
        { path: '/admin/users', label: 'Users' }
    ];

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <h2>Admin Portal</h2>
                </div>
                <nav className="admin-nav">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="admin-sidebar-footer">
                    <button onClick={handleLogout} className="btn-logout">
                        Logout
                    </button>
                </div>
            </aside>
            <main className="admin-content-area">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
