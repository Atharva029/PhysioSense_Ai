import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function register(email, password, displayName) {
    if (!auth) {
      return Promise.reject(new Error('Firebase is not configured. Please set up Firebase in client/.env'));
    }
    return createUserWithEmailAndPassword(auth, email, password).then(
      async (userCredential) => {
        // Register user in backend
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, displayName }),
          });
          if (!response.ok) {
            console.warn('Backend registration failed:', await response.text());
          }
        } catch (error) {
          console.warn('Backend registration error:', error);
        }
        return userCredential;
      }
    );
  }

  function login(email, password) {
    if (!auth) {
      return Promise.reject(new Error('Firebase is not configured. Please set up Firebase in client/.env'));
    }
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    if (!auth) {
      return Promise.resolve();
    }
    return signOut(auth);
  }

  useEffect(() => {
    if (!auth) {
      // If Firebase is not configured, just set loading to false
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        user.getIdToken().then((token) => {
          localStorage.setItem('token', token);
        }).catch((error) => {
          console.warn('Token error:', error);
        });
      } else {
        localStorage.removeItem('token');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
