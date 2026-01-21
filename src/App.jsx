// src/App.tsx
import { useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage'; // Eklendi
import ChatLayout from './features/chat/ChatLayout';
import { selectCurrentToken } from './features/auth/authSlice';

function PrivateRoute({ children }) {
    const token = useSelector(selectCurrentToken);
    return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} /> {/* Eklendi */}
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <ChatLayout />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;