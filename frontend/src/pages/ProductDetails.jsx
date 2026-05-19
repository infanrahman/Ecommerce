import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { ArrowLeft } from 'lucide-react';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const { addToCart } = useCart();

    useEffect(() => {
        axios.get(`/api/products/${id}/`)
            .then(res => setProduct(res.data))
            .catch(err => console.error(err));
    }, [id]);

    if (!product) return <div className="page-container">Loading...</div>;

    return (
        <div className="page-container product-detail-container">
            <button className="back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft className="icon" /> Back
            </button>
            <div className="product-detail">
                <div className="product-detail-image-wrap">
                    {product.image ? (
                        <img src={product.image} alt={product.name} className="product-detail-image" />
                    ) : (
                        <div className="product-image-placeholder large">No Image</div>
                    )}
                </div>
                <div className="product-detail-info">
                    <h2>{product.name}</h2>
                    <p className="detail-price">${product.price}</p>
                    <p className="detail-desc">{product.description || "No description available."}</p>
                    <p className="detail-stock">Stock: {product.stock > 0 ? product.stock : 'Out of Stock'}</p>
                    <button 
                        onClick={() => addToCart(product)} 
                        className="btn-primary large"
                        disabled={product.stock <= 0}
                    >
                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
