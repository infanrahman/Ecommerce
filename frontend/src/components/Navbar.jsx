import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Store } from 'lucide-react';

const Navbar = () => {
    const { cart } = useCart();
    const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    <Store className="icon" /> E-Shop Demo
                </Link>
                <div className="nav-links">
                    <Link to="/cart" className="cart-link">
                        <ShoppingCart className="icon" />
                        {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
