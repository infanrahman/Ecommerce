import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('/api/token/', {
                username,
                password
            });
            
            // Decrypt token to get user details via fetchUser
            localStorage.setItem('adminToken', response.data.access);
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.access;
            const userRes = await axios.get('/api/users/me/');
            
            if (!userRes.data.is_staff) {
                localStorage.removeItem('adminToken');
                delete axios.defaults.headers.common['Authorization'];
                setError('Access denied. You do not have administrator permissions.');
                return;
            }
            
            // Fully log in the user in the context
            await login(response.data.access);
            navigate('/admin');
        } catch (err) {
            console.error("Login error details:", err);
            if (err.response) {
                if (err.response.status === 401) {
                    setError('Invalid username or password.');
                } else {
                    setError(`Server Error (${err.response.status}): ${JSON.stringify(err.response.data)}`);
                }
            } else if (err.request) {
                // Determine absolute request URL
                const requestUrl = err.config.url.startsWith('http') 
                    ? err.config.url 
                    : (axios.defaults.baseURL.replace(/\/$/, '') + '/' + err.config.url.replace(/^\//, ''));
                setError(`Network Error: Request sent to ${requestUrl} but no response was received. Check if VITE_API_URL is correct.`);
            } else {
                setError(`Request Error: ${err.message}`);
            }
        }
    };

    return (
        <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div className="checkout-form" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>Admin Login</h2>
                {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                        <label>Username</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Login</button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
