import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="welcome-container">
            <h1>Welcome to our website!</h1>
            <p>Hello, {user.name || 'Guest'}</p>
            <p>We are glad to have you here at Famly.</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Welcome;
