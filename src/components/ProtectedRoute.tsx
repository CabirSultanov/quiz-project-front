import React, {JSX} from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../store';

interface ProtectedRouteProps {
    element: JSX.Element;
    requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, requiredRole }) => {
    const auth = useSelector((state: RootState) => state.auth);

    if (!auth.isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (requiredRole && auth.user?.role !== requiredRole) {
        return <Navigate to="/home" replace />;
    }

    return element;
};

export default ProtectedRoute;