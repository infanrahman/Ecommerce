import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AdminProducts = () => {
    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null); // Null for create, product object for edit

    // Form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('0');
    const [category, setCategory] = useState('');
    const [imageFile, setImageFile] = useState(null);

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
        setImageFile(null);
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setCurrentProduct(product);
        setName(product.name);
        setDescription(product.description || '');
        setPrice(product.price);
        setStock(product.stock.toString());
        setCategory(product.category || '');
        setImageFile(null);
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Use FormData to allow image upload
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('stock', stock);
        if (category) {
            formData.append('category', category);
        }
        if (imageFile) {
            formData.append('image', imageFile);
        }

        const multipartConfig = {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        };

        try {
            if (currentProduct) {
                // Update
                await axios.put(`/api/products/${currentProduct.id}/`, formData, multipartConfig);
            } else {
                // Create
                await axios.post('/api/products/', formData, multipartConfig);
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (error) {
            console.error("Error saving product", error);
            alert("Error saving product. Please check the values.");
        }
    };

    if (loading) return <div className="page-container">Loading products...</div>;

    return (
        <div>
            <header className="page-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
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
                                <td>
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                    ) : (
                                        <div style={{ width: '50px', height: '50px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderRadius: '4px' }}>No Image</div>
                                    )}
                                </td>
                                <td><strong>{product.name}</strong></td>
                                <td>{product.category_name || 'Uncategorized'}</td>
                                <td>${product.price}</td>
                                <td>{product.stock}</td>
                                <td>
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
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Price ($)</label>
                                    <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Stock</label>
                                    <input type="number" value={stock} onChange={e => setStock(e.target.value)} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Product Image</label>
                                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ border: 'none', padding: '0' }} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline">Cancel</button>
                                <button type="submit" className="btn-primary">Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
