// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate, Link } from 'react-router-dom';

// const Signup = () => {
//     const [formData, setFormData] = useState({
//         username: '',
//         password: '',
//         role: 'analyst'
//     });
//     const [error, setError] = useState('');
//     const navigate = useNavigate();

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const handleSignup = async (e) => {
//         e.preventDefault();
//         try {
//             const res = await axios.post('http://localhost:5000/api/auth/register', formData);
//             if (res.data.success) {
//                 navigate('/login');
//             }
//         } catch (err) {
//             setError(err.response?.data?.message || 'Signup failed');
//         }
//     };

//     return (
//         <div className="login-container">
//             <h2>Famly Signup</h2>
//             <form onSubmit={handleSignup}>
//                 <div>
//                     <label>Username:</label>
//                     <input
//                         type="text"
//                         name="username"
//                         value={formData.username}
//                         onChange={handleChange}
//                         required
//                     />
//                 </div>
//                 <div>
//                     <label>Password:</label>
//                     <input
//                         type="password"
//                         name="password"
//                         value={formData.password}
//                         onChange={handleChange}
//                         required
//                     />
//                 </div>
//                 <div>
//                     <label>Role:</label>
//                     <select name="role" value={formData.role} onChange={handleChange}>
//                         <option value="analyst">Analyst</option>
//                         <option value="admin">Admin</option>
//                     </select>
//                 </div>
//                 {error && <p style={{ color: 'red' }}>{error}</p>}
//                 <button type="submit">Signup</button>
//             </form>
//             <p>
//                 Already have an account? <Link to="/login">Login</Link>
//             </p>
//         </div>
//     );
// };

// export default Signup;


import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'analyst'
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/register', formData);
            if (res.data.success) {
                navigate('/login');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#e3f2fd",  // Light blue background
            }}
        >
            <div
                style={{
                    background: "white",
                    padding: "35px",
                    width: "350px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                    textAlign: "center"
                }}
            >
                <h2 style={{ marginBottom: "20px", color: "#0d47a1", fontWeight: "bold" }}>
                    Family Signup
                </h2>

                <form onSubmit={handleSignup}>
                    <div style={{ marginBottom: "15px", textAlign: "left" }}>
                        <label style={{ fontWeight: "bold", color: "#0d47a1" }}>Username:</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ marginBottom: "15px", textAlign: "left" }}>
                        <label style={{ fontWeight: "bold", color: "#0d47a1" }}>Password:</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ marginBottom: "20px", textAlign: "left" }}>
                        <label style={{ fontWeight: "bold", color: "#0d47a1" }}>Role:</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            style={{
                                ...inputStyle,
                                height: "40px",
                                cursor: "pointer"
                            }}
                        >
                            <option value="analyst">Analyst</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {error && (
                        <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>
                    )}

                    <button
                        type="submit"
                        style={{
                            width: "100%",
                            padding: "12px",
                            background: "#0d47a1",
                            color: "white",
                            fontWeight: "bold",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "16px"
                        }}
                    >
                        Signup
                    </button>
                </form>

                <p style={{ marginTop: "15px", fontWeight: "bold", color: "#0d47a1" }}>
                    Already have an account?{" "}
                    <Link to="/login" style={{ color: "#1565c0", fontWeight: "bold" }}>
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #64b5f6",
    marginTop: "5px",
    outline: "none",
    fontSize: "15px",
    background: "#f0f7ff",
    fontWeight: "bold",
    color: "#0d47a1"
};

export default Signup;
