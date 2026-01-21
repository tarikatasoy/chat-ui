// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentToken } from '../features/auth/authSlice';
import { addMessage, updateOnlineStatus, setOnlineFriends, setTyping  } from '../features/chat/chatSlice';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const token = useSelector(selectCurrentToken);
  const dispatch = useDispatch();

  useEffect(() => {
    if (token) {
      const newSocket = io('http://chat.tarikatasoy.com/api', {
        auth: {
          token: token,
        },
      });
      setSocket(newSocket);

      // Gelen olayları dinle
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
      });
      
      newSocket.on('message:new', (message) => {
        console.log('New message received:', message);
        dispatch(addMessage({ conversationId: message.conversationId, message }));
      });
      
      newSocket.on('user:online', ({ id }) => {
        console.log('User online:', id);
        dispatch(updateOnlineStatus({ userId: id, isOnline: true }));
      });

      newSocket.on('user:offline', ({ id }) => {
        console.log('User offline:', id);
        dispatch(updateOnlineStatus({ userId: id, isOnline: false }));
      });

      newSocket.on('friends:online', (onlineFriendIds) => {
        console.log('Online friends list:', onlineFriendIds);
        dispatch(setOnlineFriends(onlineFriendIds));
      });
      
      newSocket.on('friend_request:new', (request) => {
          // Burada bir bildirim gösterebilirsiniz (örn: react-toastify)
          console.log('New friend request:', request);
          alert(`New friend request from ${request.from.username}`);
      });
      
      newSocket.on('friend_request:accepted', (acceptance) => {
          console.log('Friend request accepted:', acceptance);
          alert(`${acceptance.acceptedBy.username} accepted your friend request.`);
          // Sohbet listesini yenilemek için bir action dispatch edilebilir
      });

      newSocket.on('typing:start', ({ conversationId }) => {
        dispatch(setTyping({ conversationId, isTyping: true }));
      });

      newSocket.on('typing:stop', ({ conversationId }) => {
        dispatch(setTyping({ conversationId, isTyping: false }));
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      return () => newSocket.close();
    }
  }, [token, dispatch]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};