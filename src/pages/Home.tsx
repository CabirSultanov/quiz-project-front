import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import api from '../api';
import { Quiz } from '../types';
import Navbar from '../components/Navbar';

const Home: React.FC = () => {
    const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
    const [score, setScore] = useState<number | null>(null);
    const [totalQuestions, setTotalQuestions] = useState<number>(0);

    const auth = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate('/');
        }
    }, [auth.isAuthenticated, navigate]);

    const fetchQuiz = async () => {
        if (selectedDifficulty === null) return;
        try {
            const response = await api.get('/UserQuiz/random', {
                params: { difficulty: selectedDifficulty },
            });
            setQuiz(response.data);
            setTotalQuestions(response.data.questions.length);
        } catch (error) {
            console.error('Error fetching quiz:', error);
        }
    };

    const selectAnswer = (questionId: number, answerId: number) => {
        setUserAnswers((prev) => ({ ...prev, [questionId]: answerId }));
    };

    const submitQuiz = async () => {
        if (!quiz) return;
        const answerRequests = quiz.questions.map((q) => ({
            QuestionId: q.id,
            SelectedAnswerId: userAnswers[q.id],
        }));
        try {
            const response = await api.post(`/UserQuiz/${quiz.id}/submit`, { Answers: answerRequests });
            setScore(response.data.score);
            setTotalQuestions(quiz.questions.length);
            setQuiz(null);
            setUserAnswers({});
        } catch (error) {
            console.error('Error submitting quiz:', error);
        }
    };

    if (score !== null) {
        return (
            <>
                <Navbar />
                <div className="container text-center mt-5">
                    <h2>Your Score: {score} / {totalQuestions}</h2>
                    <button
                        type="button"
                        className="btn btn-primary mt-3"
                        onClick={() => {
                            setScore(null);
                            setSelectedDifficulty(null);
                            setUserAnswers({});
                        }}
                    >
                        Start New Quiz
                    </button>
                </div>
            </>
        );
    }

    if (!quiz) {
        return (
            <>
                <Navbar />
                <div className="container text-center mt-5">
                    <h2>Select Difficulty Level</h2>
                    <div className="btn-group mt-3" role="group">
                        <button
                            type="button"
                            className={`btn btn-primary ${selectedDifficulty === 1 ? 'active' : ''}`}
                            onClick={() => setSelectedDifficulty(1)}
                        >
                            Easy
                        </button>
                        <button
                            type="button"
                            className={`btn btn-primary ${selectedDifficulty === 2 ? 'active' : ''}`}
                            onClick={() => setSelectedDifficulty(2)}
                        >
                            Medium
                        </button>
                        <button
                            type="button"
                            className={`btn btn-primary ${selectedDifficulty === 3 ? 'active' : ''}`}
                            onClick={() => setSelectedDifficulty(3)}
                        >
                            Hard
                        </button>
                    </div>
                    <div className="mt-3">
                        <button
                            type="button"
                            className="btn btn-success"
                            disabled={selectedDifficulty === null}
                            onClick={fetchQuiz}
                        >
                            Proceed
                        </button>
                    </div>
                </div>
            </>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];

    return (
        <>
            <Navbar />
            <div className="container mt-5">
                <h3>{currentQuestion.text}</h3>
                <div className="list-group mt-3">
                    {currentQuestion.answers.map((answer) => (
                        <button
                            key={answer.id}
                            type="button"
                            className={`list-group-item list-group-item-action ${
                                userAnswers[currentQuestion.id] === answer.id ? 'active' : ''
                            }`}
                            onClick={() => selectAnswer(currentQuestion.id, answer.id)}
                        >
                            {answer.text}
                        </button>
                    ))}
                </div>
                <div className="mt-3">
                    <button
                        type="button"
                        className="btn btn-secondary me-2"
                        disabled={currentQuestionIndex === 0}
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                    >
                        Previous
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={currentQuestionIndex === quiz.questions.length - 1}
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                    >
                        Next
                    </button>
                    {currentQuestionIndex === quiz.questions.length - 1 && (
                        <button
                            type="button"
                            className="btn btn-primary ms-2"
                            onClick={submitQuiz}
                            disabled={Object.keys(userAnswers).length < quiz.questions.length}
                        >
                            Submit
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default Home;