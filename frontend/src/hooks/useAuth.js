import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

/**
 * Custom hook to easily access Authentication context
 * @returns {Object} { user, isAuthenticated, login, signup, logout, ... }
 */
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

export default useAuth;
