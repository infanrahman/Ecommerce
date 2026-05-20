import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Store, X, Menu, User } from 'lucide-react';

const Navbar = () => {
    const { cart } = useCart();
    const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => setMenuOpen(false);

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo" onClick={closeMenu}>
                    <Store className="icon" /> E-Shop Demo
                </Link>

                {/* Hamburger button — visible only on mobile via CSS */}
                <button
                    className="hamburger"
                    onClick={() => setMenuOpen(prev => !prev)}
                    aria-label="Toggle navigation"
                >
                    {menuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>

                {/* Overlay behind the open mobile menu */}
                <div
                    className={`nav-overlay${menuOpen ? ' open' : ''}`}
                    onClick={closeMenu}
                />

                {/* Nav menu — slides in on mobile, horizontal on desktop */}
                <div className={`nav-menu${menuOpen ? ' open' : ''}`}>
                    <Link to="/profile" className="cart-link" onClick={closeMenu}>
                        <User className="icon" />
                        <span style={{ marginLeft: '0.5rem' }}>Profile</span>
                    </Link>
                    <Link to="/cart" className="cart-link" onClick={closeMenu}>
                        <ShoppingCart className="icon" />
                        {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                        <span style={{ marginLeft: '0.5rem' }}>Cart {itemCount > 0 ? `(${itemCount})` : ''}</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
