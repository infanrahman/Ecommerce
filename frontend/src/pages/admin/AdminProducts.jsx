import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AdminProducts = () => {
    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [saving, setSaving] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('0');
    const [category, setCategory] = useState('');
    const [imageBase64, setImageBase64] = useState(null); // base64 DataURL

    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchProducts = async () => {
        try {
            const res = await axios.get('/api/products/', config);
            setProducts(res.data);
        } catch (error) {
            console.error("Error fetching products", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/api/categories/', config);
            setCategories(res.data);
        } catch (error) {
            console.error("Error fetching categories", error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([fetchProducts(), fetchCategories()]);
            setLoading(false);
        };
        if (token) loadData();
    }, [token]);

    const openCreateModal = () => {
        setCurrentProduct(null);
        setName('');
        setDescription('');
        setPrice('');
        setStock('0');
        setCategory('');
        setImageBase64(null);
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setCurrentProduct(product);
        setName(product.name);
        setDescription(product.description || '');
        setPrice(product.price);
        setStock(product.stock.toString());
        setCategory(product.category || '');
        setImageBase64(product.image || null); // keep existing image
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await axios.delete(`/api/products/${id}/`, config);
                fetchProducts();
            } catch (error) {
                console.error("Error deleting product", error);
            }
        }
    };

    // Convert selected file to base64 DataURL
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageBase64(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        // Build JSON payload — no filesystem writes needed
        const productData = {
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock, 10),
            category: category ? parseInt(category, 10) : null,
            image: imageBase64 || null,
        };

        const jsonConfig = {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        };

        try {
            if (currentProduct) {
                await axios.put(`/api/products/${currentProduct.id}/`, productData, jsonConfig);
            } else {
                await axios.post('/api/products/', productData, jsonConfig);
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (error) {
            console.error("Error saving product", error);
            let errorMessage = "Error saving product. Please check the values.";
            if (error.response && error.response.data) {
                errorMessage += "\nDetails: " + JSON.stringify(error.response.data);
            } else if (error.message) {
                errorMessage += "\n" + error.message;
            }
            alert(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="page-container">Loading products...</div>;

    return (
        <div>
            <header className="page-header admin-page-header">
                <div>
                    <h1>Manage Products</h1>
                    <p style={{ color: 'var(--text-muted)' }}>View, add, edit, and delete products in your store.</p>
                </div>
                <button onClick={openCreateModal} className="btn-primary">Add Product</button>
            </header>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td data-label="Image">
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                    ) : (
                                        <div style={{ width: '50px', height: '50px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderRadius: '4px' }}>No Image</div>
                                    )}
                                </td>
                                <td data-label="Name"><strong>{product.name}</strong></td>
                                <td data-label="Category">{product.category_name || 'Uncategorized'}</td>
                                <td data-label="Price">${product.price}</td>
                                <td data-label="Stock">{product.stock}</td>
                                <td data-label="Actions">
                                    <div className="table-actions">
                                        <button onClick={() => openEditModal(product)} className="btn-edit">Edit</button>
                                        <button onClick={() => handleDelete(product.id)} className="btn-delete">Delete</button>
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
                            <h2>{currentProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="modal-close">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex-col gap-1">
                            <div className="form-group">
                                <label>Product Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                                    <option value="">Uncategorized</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', minHeight: '80px', fontFamily: 'inherit' }} />
                            </div>
                            <div className="flex-row-responsive gap-1">
                                <div className="form-group w-full">
                                    <label>Price ($)</label>
                                    <input type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} required />
                                </div>
                                <div className="form-group w-full">
                                    <label>Stock</label>
                                    <input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Product Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ border: 'none', padding: '0' }}
                                />
                                {imageBase64 && (
                                    <img
                                        src={imageBase64}
                                        alt="Preview"
                                        style={{ marginTop: '0.5rem', width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }}
                                    />
                                )}
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline">Cancel</button>
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
