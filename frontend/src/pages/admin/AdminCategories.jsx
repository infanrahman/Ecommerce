import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AdminCategories = () => {
    const { token } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null); // Null for create, category object for edit

    // Form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/api/categories/', config);
            setCategories(res.data);
        } catch (error) {
            console.error("Error fetching categories", error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchCategories().finally(() => setLoading(false));
        }
    }, [token]);

    const openCreateModal = () => {
        setCurrentCategory(null);
        setName('');
        setDescription('');
        setIsModalOpen(true);
    };

    const openEditModal = (category) => {
        setCurrentCategory(category);
        setName(category.name);
        setDescription(category.description || '');
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this category? Products belonging to this category will be set to uncategorized.")) {
            try {
                await axios.delete(`/api/categories/${id}/`, config);
                fetchCategories();
            } catch (error) {
                console.error("Error deleting category", error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { name, description };

        try {
            if (currentCategory) {
                await axios.put(`/api/categories/${currentCategory.id}/`, payload, config);
            } else {
                await axios.post('/api/categories/', payload, config);
            }
            setIsModalOpen(false);
            fetchCategories();
        } catch (error) {
            console.error("Error saving category", error);
            alert("Error saving category. Please try again.");
        }
    };

    if (loading) return <div className="page-container">Loading categories...</div>;

    return (
        <div>
            <header className="page-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Manage Categories</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Create, edit, and delete categories for products.</p>
                </div>
                <button onClick={openCreateModal} className="btn-primary">Add Category</button>
            </header>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(category => (
                            <tr key={category.id}>
                                <td><strong>{category.name}</strong></td>
                                <td>{category.description || '-'}</td>
                                <td>
                                    <div className="table-actions">
                                        <button onClick={() => openEditModal(category)} className="btn-edit">Edit</button>
                                        <button onClick={() => handleDelete(category.id)} className="btn-delete">Delete</button>
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
                            <h2>{currentCategory ? 'Edit Category' : 'Add New Category'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="modal-close">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Category Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', minHeight: '80px', fontFamily: 'inherit' }} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline">Cancel</button>
                                <button type="submit" className="btn-primary">Save Category</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
