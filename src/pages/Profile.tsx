import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import api from '../api';
import { UserProfile, QuizAttempt } from '../types';
import Navbar from '../components/Navbar';

const Profile: React.FC = () => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const auth = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate('/');
        } else {
            const fetchData = async () => {
                try {
                    const userResponse = await api.get('/User/user');
                    setUserProfile(userResponse.data);

                    const attemptsResponse = await api.get('/UserQuiz/attempts');
                    setQuizAttempts(attemptsResponse.data);
                } catch (err: any) {
                    setError('Failed to fetch data');
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [auth.isAuthenticated, navigate]);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="container text-center mt-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="container text-center mt-5">
                    <div className="alert alert-danger">{error}</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="container mt-5">
                <h2>Profile</h2>
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-3">
                                {userProfile?.imageUrl ? (
                                    <img src={userProfile.imageUrl} alt="Profile" className="img-fluid rounded" />
                                ) : (
                                    <div className="bg-secondary text-white d-flex align-items-center justify-content-center" style={{ height: '150px', width: '150px' }}>
                                        No Image
                                    </div>
                                )}
                            </div>
                            <div className="col-md-9">
                                <h4>{userProfile?.firstName} {userProfile?.lastName}</h4>
                                <p><strong>Username:</strong> {userProfile?.username}</p>
                                <p><strong>Email:</strong> {userProfile?.email}</p>
                                <p><strong>Phone:</strong> {userProfile?.phoneNumber}</p>
                                <p><strong>Role:</strong> {userProfile?.roleId === 1 ? 'Admin' : 'User'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <h3>Quiz Attempts</h3>
                {quizAttempts.length > 0 ? (
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <th>Quiz Title</th>
                            <th>Difficulty</th>
                            <th>Score</th>
                            <th>Date</th>
                        </tr>
                        </thead>
                        <tbody>
                        {quizAttempts.map((attempt, index) => (
                            <tr key={index}>
                                <td>{attempt.quizTitle}</td>
                                <td>{attempt.difficultyLevel}</td>
                                <td>{attempt.score}</td>
                                <td>{new Date(attempt.date).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No quiz attempts yet.</p>
                )}
            </div>
        </>
    );
};

export default Profile;