// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import chatReducer from './features/chat/chatSlice'; // Eklendi

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer, // Eklendi
  },
});