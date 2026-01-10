import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ExerciseSession from './pages/ExerciseSession';
import Progress from './pages/Progress';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <>
                  <Navbar />
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                </>
              }
            />
            <Route
              path="/exercise/:exerciseName"
              element={
                <>
                  <Navbar />
                  <PrivateRoute>
                    <ExerciseSession />
                  </PrivateRoute>
                </>
              }
            />
            <Route
              path="/progress"
              element={
                <>
                  <Navbar />
                  <PrivateRoute>
                    <Progress />
                  </PrivateRoute>
                </>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
