export interface Quiz {
    id: number;
    title: string;
    description: string;
    difficultyLevel: number;
    imageUrl?: string;
    questions: Question[];
}

export interface Question {
    id: number;
    text: string;
    quizId: number;
    answers: Answer[];
}

export interface Answer {
    id: number;
    text: string;
    isCorrect: boolean;
    questionId: number;
}

export interface UserProfile {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    imageUrl?: string;
    roleId: number;
}

export interface QuizAttempt {
    quizTitle: string;
    difficultyLevel: number;
    score: number;
    date: string;
}