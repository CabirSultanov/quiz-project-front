import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api';

const VerifyEmail: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = (location.state as { userId?: number; email?: string }) || {};
    const { userId, email } = state;
    const [code, setCode] = useState<string>('');
    const [error, setError] = useState<string>('');

    if (!userId || !email) {
        return (
            <div className="container text-center mt-5">
                <div className="alert alert-danger">Invalid verification data.</div>
                <Link to="/">Go to Login</Link>
            </div>
        );
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length !== 4) {
            setError('Enter a 4-digit code.');
            return;
        }
        try {
            await api.post('/Auth/verify-email', { userId, code });
            navigate('/', { state: { message: 'Email verified. Please login.' } });
        } catch (err: any) {
            setError(err.response?.data || 'Verification error');
        }
    };

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card mt-5">
                        <div className="card-body">
                            <h3 className="card-title text-center">Enter Verification Code</h3>
                            <p className="text-center">A code was sent to <strong>{email}</strong>.</p>
                            {error && <div className="alert alert-danger">{error}</div>}
                            <form onSubmit={handleVerify}>
                                <div className="mb-3">
                                    <label htmlFor="code" className="form-label">Verification Code</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="code"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100">Verify</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail; 