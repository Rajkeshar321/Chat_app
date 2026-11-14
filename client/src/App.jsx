
import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import { Toaster } from 'react-hot-toast'
import { AuthContext } from '../context/AuthContext'
import bgImage from './assets/bgImage.svg'

const App = () => {
  const { authUser } = useContext(AuthContext)

  return (
    <div
      className="min-h-screen bg-contain bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${bgImage})`
      }}
    >
      <Toaster />

      <Routes>
        {/* Protected Home Route */}
        <Route
          path="/"
          element={
            authUser ? <HomePage /> : <Navigate to="/login" />
          }
        />

        {/* Login Route */}
        <Route
          path="/login"
          element={
            !authUser ? <LoginPage /> : <Navigate to="/" />
          }
        />

        {/* Protected Profile Route */}
        <Route
          path="/profile"
          element={
            authUser ? <ProfilePage /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </div>
  )
}

export default App
