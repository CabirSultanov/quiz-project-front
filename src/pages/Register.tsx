import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Register: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [roleId, setRoleId] = useState<number>(2);
    const [image, setImage] = useState<File | null>(null);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    const handleRegister = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!username || !password || !firstName || !lastName || !email || !phoneNumber) {
            setError('Fill all fields');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('Username', username);
            formData.append('Password', password);
            formData.append('FirstName', firstName);
            formData.append('LastName', lastName);
            formData.append('Email', email);
            formData.append('PhoneNumber', phoneNumber);
            formData.append('RoleId', roleId.toString());
            if (image) {
                formData.append('Image', image);
            }

            await api.post('/Auth/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            navigate('/', { state: { message: 'Registration successful' } });
        } catch (err: any) {
            setError(err.response?.data || 'Registration error');
        }
    };

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card mt-5">
                        <div className="card-body">
                            <h3 className="card-title text-center">Register</h3>
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
                                <div className="mb-3">
                                    <label htmlFor="firstName" className="form-label">First Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="lastName" className="form-label">Last Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="phoneNumber" className="form-label">Phone Number (9 digits)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="phoneNumber"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="role" className="form-label">Role</label>
                                    <select
                                        className="form-select"
                                        id="role"
                                        value={roleId}
                                        onChange={(e) => setRoleId(Number(e.target.value))}
                                    >
                                        <option value={2}>User</option>
                                        <option value={1}>Admin</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="image" className="form-label">Profile Image (optional)</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        id="image"
                                        onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary w-100"
                                    onClick={handleRegister}
                                >
                                    Register
                                </button>
                            </div>
                            <div className="mt-3 text-center">
                                <Link to="/">Login here</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;