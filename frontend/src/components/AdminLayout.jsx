import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';

const AdminLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="admin-layout">
            {/* Mobile Header for Admin Sidebar */}
            <div className="admin-mobile-header">
                <h2>Admin Portal</h2>
                <button 
                    className="admin-hamburger" 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    aria-label="Toggle admin menu"
                >
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Overlay for mobile sidebar */}
            <div 
                className={`admin-sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
                onClick={closeSidebar}
            />

            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header desktop-only">
                    <h2>Admin Portal</h2>
                </div>
                <nav className="admin-nav">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={closeSidebar}
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
