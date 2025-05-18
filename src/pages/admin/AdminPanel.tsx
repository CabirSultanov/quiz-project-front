import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { Quiz, Question, Answer, AdminUser } from '../../types';
import Navbar from '../../components/Navbar';

const AdminPanel: React.FC = () => {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
    const [newQuiz, setNewQuiz] = useState({ title: '', description: '', difficultyLevel: 1, image: null as File | null, questions: [] as Question[] });
    const [activeTab, setActiveTab] = useState<'quizzes' | 'users'>('quizzes');
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const response = await api.get('/Quiz');
                if (Array.isArray(response.data)) {
                    setQuizzes(response.data);
                } else {
                    setQuizzes([]);
                }
            }
            catch (error) {
                console.error('Error fetching quizzes:', error);
            }
        };
        fetchQuizzes();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/User');
                setUsers(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);

    const handleCreateQuiz = async () => {
        const formData = new FormData();
        formData.append('Title', newQuiz.title);
        formData.append('Description', newQuiz.description);
        formData.append('DifficultyLevel', newQuiz.difficultyLevel.toString());
        if (newQuiz.image) formData.append('Image', newQuiz.image);
        newQuiz.questions.forEach((q, qIndex) => {
            formData.append(`Questions[${qIndex}].Text`, q.text);
            q.answers.forEach((a, aIndex) => {
                formData.append(`Questions[${qIndex}].Answers[${aIndex}].Text`, a.text);
                formData.append(`Questions[${qIndex}].Answers[${aIndex}].IsCorrect`, a.isCorrect.toString());
            });
        });
        try {
            const response = await api.post('/Quiz', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setQuizzes([...quizzes, response.data]);
            setNewQuiz({ title: '', description: '', difficultyLevel: 1, image: null, questions: [] });
        } catch (error) {
            console.error('Error creating quiz:', error);
        }
    };

    const handleUpdateQuiz = async (quiz: Quiz) => {
        const formData = new FormData();
        formData.append('Title', quiz.title);
        formData.append('Description', quiz.description);
        formData.append('DifficultyLevel', quiz.difficultyLevel.toString());
        if (quiz.imageUrl) formData.append('Image', quiz.imageUrl);
        try {
            await api.put(`/Quiz/${quiz.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setQuizzes(quizzes.map(q => (q.id === quiz.id ? quiz : q)));
            setEditingQuiz(null);
        } catch (error) {
            console.error('Error updating quiz:', error);
        }
    };

    const handleDeleteQuiz = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this quiz?')) {
            try {
                await api.delete(`/Quiz/${id}`);
                setQuizzes(quizzes.filter(q => q.id !== id));
            } catch (error) {
                console.error('Error deleting quiz:', error);
            }
        }
    };

    const addQuestion = (quiz: Quiz) => {
        const updatedQuiz = { ...quiz, questions: [...quiz.questions, { id: Date.now(), text: '', answers: [], quizId: quiz.id }] };
        setEditingQuiz(updatedQuiz);
    };

    const updateQuestion = async (quizId: number, question: Question) => {
        try {
            await api.put(`/Quiz/question/${question.id}`, { Text: question.text, QuizId: quizId });
            setEditingQuiz(prev => prev ? { ...prev, questions: prev.questions.map(q => q.id === question.id ? question : q) } : null);
        } catch (error) {
            console.error('Error updating question:', error);
        }
    };

    const deleteQuestion = async (quizId: number, questionId: number) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            try {
                await api.delete(`/Quiz/question/${questionId}`);
                setEditingQuiz(prev => prev ? { ...prev, questions: prev.questions.filter(q => q.id !== questionId) } : null);
            } catch (error) {
                console.error('Error deleting question:', error);
            }
        }
    };

    const addAnswer = (quiz: Quiz, questionIndex: number) => {
        const updatedQuestions = [...quiz.questions];
        updatedQuestions[questionIndex].answers.push({ id: Date.now(), text: '', isCorrect: false, questionId: updatedQuestions[questionIndex].id });
        setEditingQuiz({ ...quiz, questions: updatedQuestions });
    };

    const updateAnswer = async (answer: Answer) => {
        try {
            await api.put(`/Quiz/answer/${answer.id}`, { Text: answer.text, IsCorrect: answer.isCorrect, QuestionId: answer.questionId });
            setEditingQuiz(prev => {
                if (!prev) return null;
                const updatedQuestions = prev.questions.map(q => ({
                    ...q,
                    answers: q.answers.map(a => a.id === answer.id ? answer : a)
                }));
                return { ...prev, questions: updatedQuestions };
            });
        } catch (error) {
            console.error('Error updating answer:', error);
        }
    };

    const deleteAnswer = async (questionId: number, answerId: number) => {
        if (window.confirm('Are you sure you want to delete this answer?')) {
            try {
                await api.delete(`/Quiz/answer/${answerId}`);
                setEditingQuiz(prev => {
                    if (!prev) return null;
                    const updatedQuestions = prev.questions.map(q => ({
                        ...q,
                        answers: q.id === questionId ? q.answers.filter(a => a.id !== answerId) : q.answers
                    }));
                    return { ...prev, questions: updatedQuestions };
                });
            } catch (error) {
                console.error('Error deleting answer:', error);
            }
        }
    };

    const createQuestion = async (question: Question) => {
        const formData = new FormData();
        formData.append('Text', question.text);
        formData.append('QuizId', question.quizId.toString());
        question.answers.forEach((a, i) => {
            formData.append(`Answers[${i}].Text`, a.text);
            formData.append(`Answers[${i}].IsCorrect`, a.isCorrect.toString());
        });
        const response = await api.post('/Quiz/question', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        return response.data as Question;
    };

    const updateQuizDetails = async (quizToSave: Quiz) => {
        const formData = new FormData();
        formData.append('Title', quizToSave.title);
        formData.append('Description', quizToSave.description);
        formData.append('DifficultyLevel', quizToSave.difficultyLevel.toString());
        if (quizToSave.imageUrl) formData.append('Image', quizToSave.imageUrl);
        await api.put(`/Quiz/${quizToSave.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setQuizzes(prev => prev.map(q => q.id === quizToSave.id ? quizToSave : q));
    };

    const handleSaveQuiz = async (quizToSave: Quiz) => {
        try {
            const original = quizzes.find(q => q.id === quizToSave.id);
            const originalIds = original ? original.questions.map(q => q.id) : [];
            await updateQuizDetails(quizToSave);
            for (const question of quizToSave.questions) {
                if (!originalIds.includes(question.id)) {
                    await createQuestion(question);
                }
            }
            const response = await api.get('/Quiz');
            if (Array.isArray(response.data)) {
                setQuizzes(response.data);
            }
            setEditingQuiz(null);
        } catch (error) {
            console.error('Error saving quiz and questions:', error);
        }
    };

    const handleUpdateUser = async (user: AdminUser) => {
        const formData = new FormData();
        formData.append('FirstName', user.firstName);
        formData.append('LastName', user.lastName);
        formData.append('Email', user.email);
        formData.append('PhoneNumber', user.phoneNumber);
        formData.append('RoleId', user.roleId.toString());
        try {
            await api.put(`/User/${user.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setUsers(users.map(u => (u.id === user.id ? user : u)));
            setEditingUser(null);
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/User/${id}`);
                setUsers(users.filter(u => u.id !== id));
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    return (
        <>
            <Navbar />
            <div className="container mt-5">
                <h2>Admin Panel</h2>
                <div className="btn-group mb-4">
                    <button className={`btn btn-${activeTab === 'quizzes' ? 'primary' : 'secondary'}`} onClick={() => setActiveTab('quizzes')}>Quizzes</button>
                    <button className={`btn btn-${activeTab === 'users' ? 'primary' : 'secondary'}`} onClick={() => setActiveTab('users')}>Users</button>
                </div>
                {activeTab === 'quizzes' && (
                    <>
                        <br />
                        <h4>Create New Quiz</h4>
                        <div className="mb-4">
                            <input type="text" className="form-control mb-2" placeholder="Title" value={newQuiz.title} onChange={e => setNewQuiz({ ...newQuiz, title: e.target.value })} />
                            <textarea className="form-control mb-2" placeholder="Description" value={newQuiz.description} onChange={e => setNewQuiz({ ...newQuiz, description: e.target.value })} />
                            <select className="form-select mb-2" value={newQuiz.difficultyLevel} onChange={e => setNewQuiz({ ...newQuiz, difficultyLevel: Number(e.target.value) })}>
                                <option value={1}>Easy</option>
                                <option value={2}>Medium</option>
                                <option value={3}>Hard</option>
                            </select>
                            <input type="file" className="form-control mb-2" onChange={e => setNewQuiz({ ...newQuiz, image: e.target.files ? e.target.files[0] : null })} />
                            <button className="btn btn-success" onClick={handleCreateQuiz}>Create Quiz</button>
                        </div>

                        <h4>Manage Quizzes</h4>
                        {quizzes.map(quiz => (
                            <div key={quiz.id} className="card mb-3">
                                <div className="card-body">
                                    {editingQuiz && editingQuiz.id === quiz.id ? (
                                        <>
                                            <input type="text" className="form-control mb-2" value={editingQuiz.title} onChange={e => setEditingQuiz({ ...editingQuiz, title: e.target.value })} />
                                            <textarea className="form-control mb-2" value={editingQuiz.description} onChange={e => setEditingQuiz({ ...editingQuiz, description: e.target.value })} />
                                            <select className="form-select mb-2" value={editingQuiz.difficultyLevel} onChange={e => setEditingQuiz({ ...editingQuiz, difficultyLevel: Number(e.target.value) })}>
                                                <option value={1}>Easy</option>
                                                <option value={2}>Medium</option>
                                                <option value={3}>Hard</option>
                                            </select>
                                            <button className="btn btn-success me-2" onClick={() => editingQuiz && handleSaveQuiz(editingQuiz)}>Save</button>
                                            <button className="btn btn-secondary" onClick={() => setEditingQuiz(null)}>Cancel</button>

                                            <h4 className="mt-3">Questions</h4>
                                            {editingQuiz.questions.map((question, qIndex) => (
                                                <div key={question.id} className="mb-3">
                                                    <input
                                                        type="text"
                                                        className="form-control mb-2"
                                                        value={question.text}
                                                        onChange={e => {
                                                            const updatedQuestions = [...editingQuiz.questions];
                                                            updatedQuestions[qIndex].text = e.target.value;
                                                            setEditingQuiz({ ...editingQuiz, questions: updatedQuestions });
                                                        }}
                                                        onBlur={() => updateQuestion(quiz.id, question)}
                                                    />
                                                    <button className="btn btn-danger me-2" onClick={() => deleteQuestion(quiz.id, question.id)}>Delete Question</button>
                                                    <button className="btn btn-secondary" onClick={() => addAnswer(editingQuiz, qIndex)}>Add Answer</button>

                                                    {/* Answers */}
                                                    {question.answers.map((answer, aIndex) => (
                                                        <div key={answer.id} className="input-group mb-2">
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={answer.text}
                                                                onChange={e => {
                                                                    const updatedQuestions = [...editingQuiz.questions];
                                                                    updatedQuestions[qIndex].answers[aIndex].text = e.target.value;
                                                                    setEditingQuiz({ ...editingQuiz, questions: updatedQuestions });
                                                                }}
                                                                onBlur={() => updateAnswer(answer)}
                                                            />
                                                            <div className="input-group-text">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={answer.isCorrect}
                                                                    onChange={e => {
                                                                        const updatedQuestions = [...editingQuiz.questions];
                                                                        updatedQuestions[qIndex].answers[aIndex].isCorrect = e.target.checked;
                                                                        setEditingQuiz({ ...editingQuiz, questions: updatedQuestions });
                                                                        updateAnswer({ ...answer, isCorrect: e.target.checked });
                                                                    }}
                                                                />
                                                            </div>
                                                            <button className="btn btn-danger" onClick={() => deleteAnswer(question.id, answer.id)}>Delete Answer</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                            <button className="btn btn-primary" onClick={() => addQuestion(editingQuiz)}>Add Question</button>
                                        </>
                                    ) : (
                                        <>
                                            <h5>{quiz.title}</h5>
                                            <p>{quiz.description}</p>
                                            <p>Difficulty: {quiz.difficultyLevel}</p>
                                            <button className="btn btn-primary me-2" onClick={() => setEditingQuiz(quiz)}>Edit</button>
                                            <button className="btn btn-danger" onClick={() => handleDeleteQuiz(quiz.id)}>Delete</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </>
                )}
                {activeTab === 'users' && (
                    <>
                        <h4>Manage Users</h4>
                        {users.map(user => (
                            <div key={user.id} className="card mb-3">
                                <div className="card-body">
                                    {editingUser && editingUser.id === user.id ? (
                                        <>
                                            <input type="text" className="form-control mb-2" placeholder="First Name" value={editingUser.firstName} onChange={e => setEditingUser({ ...editingUser, firstName: e.target.value })} />
                                            <input type="text" className="form-control mb-2" placeholder="Last Name" value={editingUser.lastName} onChange={e => setEditingUser({ ...editingUser, lastName: e.target.value })} />
                                            <input type="email" className="form-control mb-2" placeholder="Email" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} />
                                            <input type="text" className="form-control mb-2" placeholder="Phone Number" value={editingUser.phoneNumber} onChange={e => setEditingUser({ ...editingUser, phoneNumber: e.target.value })} />
                                            <select className="form-select mb-2" value={editingUser.roleId} onChange={e => setEditingUser({ ...editingUser, roleId: Number(e.target.value) })}>
                                                <option value={1}>Admin</option>
                                                <option value={2}>User</option>
                                            </select>
                                            <button className="btn btn-success me-2" onClick={() => editingUser && handleUpdateUser(editingUser)}>Save</button>
                                            <button className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <h5>{user.username}</h5>
                                            <p>{user.email}</p>
                                            <button className="btn btn-primary me-2" onClick={() => setEditingUser(user)}>Edit</button>
                                            <button className="btn btn-danger" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </>
    );
};

export default AdminPanel;