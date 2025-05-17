import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../api';
import { setUser } from '../authSlice';

interface DecodedToken {
    id: string;
    sub: string;
    role: string;
}

const Login: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!username || !password) {
            setError('Fill all fields');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('Username', username);
            formData.append('Password', password);
            const response = await api.post('/Auth/login', formData);
            const { accessToken, refreshToken } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            const decoded: DecodedToken = jwtDecode(accessToken);
            const user = {
                id: decoded.id,
                username: decoded.sub,
                role: decoded.role,
            };
            dispatch(setUser(user));
            navigate('/home');
        } catch (err: any) {
            setError(err.response?.data || 'Login error');
        }
    };

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card mt-5">
                        <div className="card-body">
                            <h3 className="card-title text-center">Login</h3>
                            {error && <div className="alert alert-danger">{error}</div>}
                            <div>
                                <div className="mb-3">
                                    <label htmlFor="username" className="form-label">Username</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary w-100"
                                    onClick={handleLogin}
                                >
                                    Login
                                </button>
                            </div>
                            <div className="mt-3 text-center">
                                <Link to="/register">Register here</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;