import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('/api/categories/');
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                let url = `/api/products/?search=${search}`;
                if (selectedCategory) {
                    url += `&category=${selectedCategory}`;
                }
                const response = await axios.get(url);
                setProducts(response.data);
            } catch (error) {
                console.error("Error fetching products", error);
            }
        };
        fetchProducts();
    }, [search, selectedCategory]);

    return (
        <div className="page-container">
            <header className="page-header">
                <h1>Discover Our Products</h1>
                <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-bar"
                />
                <div className="category-tabs">
                    <button 
                        className={`category-tab ${selectedCategory === '' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('')}
                    >
                        All
                    </button>
                    {categories.map(category => (
                        <button 
                            key={category.id}
                            className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category.id)}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </header>
            
            <div className="product-grid">
                {products.length > 0 ? products.map(product => (
                    <div key={product.id} className="product-card">
                        {product.image ? (
                            <img src={product.image} alt={product.name} className="product-image" />
                        ) : (
                            <div className="product-image-placeholder">No Image</div>
                        )}
                        <div className="product-info">
                            <h3>{product.name}</h3>
                            {product.category_name && <p className="category-label" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{product.category_name}</p>}
                            <p className="price">${product.price}</p>
                            <div className="product-actions">
                                <Link to={`/product/${product.id}`} className="btn-outline">Details</Link>
                                <button onClick={() => addToCart(product)} className="btn-primary">Add to Cart</button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <p className="no-results">No products found.</p>
                )}
            </div>
        </div>
    );
};

export default Home;
