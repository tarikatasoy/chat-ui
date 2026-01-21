// src/features/chat/chatSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../lib/axios';

// Thunk to fetch conversations
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/conversations');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Thunk to fetch messages for a specific conversation
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/conversations/${conversationId}/messages`);
      return { conversationId, messages: response.data };
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const initialState = {
  conversations: [],
  messagesByConversation: {},
  activeConversationId: null,
  typingStatus: {},
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation(state, action) {
      state.activeConversationId = action.payload;
    },
    addMessage(state, action) {
        const { conversationId, message } = action.payload;
        if (state.messagesByConversation[conversationId]) {
            if (!state.messagesByConversation[conversationId].find(m => m.id === message.id)) {
                 state.messagesByConversation[conversationId].push(message);
            }
        } else {
            state.messagesByConversation[conversationId] = [message];
        }
        // Mesaj geldiğinde "yazıyor" durumunu temizle
        if (state.typingStatus[conversationId]) {
            delete state.typingStatus[conversationId];
        }
    },

    setTyping(state, action) {
      const { conversationId, isTyping } = action.payload;
      if (isTyping) {
        state.typingStatus[conversationId] = true;
      } else {
        delete state.typingStatus[conversationId];
      }
    },
    
    updateOnlineStatus(state, action) {
        const { userId, isOnline } = action.payload;
        state.conversations = state.conversations.map(conv => {
            const participant = conv.participant;
            if (participant.id === userId) {
                return { ...conv, participant: { ...participant, isOnline } };
            }
            return conv;
        });
    },
    setOnlineFriends(state, action) {
        const onlineFriendIds = new Set(action.payload);
        state.conversations = state.conversations.map(conv => {
            return {
                ...conv,
                participant: {
                    ...conv.participant,
                    isOnline: onlineFriendIds.has(conv.participant.id)
                }
            }
        });
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
          const { conversationId, messages } = action.payload;
        state.messagesByConversation[conversationId] = messages;
      });
  },
});

export const { setActiveConversation, addMessage, updateOnlineStatus, setOnlineFriends, setTyping } = chatSlice.actions; // setTyping eklendi
export default chatSlice.reducer;

// Selectors
export const selectAllConversations = (state) => state.chat.conversations;
export const selectActiveConversationId = (state) => state.chat.activeConversationId;
export const selectMessagesForActiveConversation = (state) => 
    state.chat.messagesByConversation[state.chat.activeConversationId] || [];
export const selectActiveConversation = (state) => 
    state.chat.conversations.find(c => c.id === state.chat.activeConversationId);
export const selectTypingStatusForActiveConversation = (state) =>
  state.chat.typingStatus[state.chat.activeConversationId] || false;