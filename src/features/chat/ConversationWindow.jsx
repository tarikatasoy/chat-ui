// src/features/chat/ConversationWindow.jsx
import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SendHorizonal, Paperclip, Smile, MoreVertical, Phone, Video, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSocket } from '../../context/SocketContext';
import {
    fetchMessages,
    selectMessagesForActiveConversation,
    selectActiveConversation,
    selectActiveConversationId,
    addMessage,
    selectTypingStatusForActiveConversation
} from './chatSlice';
import { selectCurrentUser } from '../auth/authSlice';

const MessageBubble = ({ text, isOwnMessage, timestamp, sender }) => (
  <div className={`flex items-end gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}>
    {!isOwnMessage && (
      <Avatar className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${sender?.username}`} alt={sender?.username} />
        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-400 to-purple-500 text-white">
          {sender?.username?.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    )}
    <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
        isOwnMessage 
        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md transform hover:scale-[1.02]' 
        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-md border border-slate-200/60 dark:border-slate-700/60 transform hover:scale-[1.02]'
    }`}>
      <p className="text-sm leading-relaxed">{text}</p>
      {timestamp && (
        <p className={`text-xs mt-1 ${isOwnMessage ? 'text-white/70' : 'text-slate-500'}`}>
          {new Date(timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
    {isOwnMessage && <div className="w-7" />}
  </div>
);

const ConversationWindow = () => {
    const dispatch = useDispatch();
    const socket = useSocket();
    const currentUser = useSelector(selectCurrentUser);
    const activeConversationId = useSelector(selectActiveConversationId);
    const activeConversation = useSelector(selectActiveConversation);
    const messages = useSelector(selectMessagesForActiveConversation);
    const isTyping = useSelector(selectTypingStatusForActiveConversation);
    const [messageText, setMessageText] = useState('');
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    
    // Hata ayıklama için console.log eklendi
    console.log(`ConversationWindow re-render. isTyping: ${isTyping}`);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (activeConversationId) {
            dispatch(fetchMessages(activeConversationId));
        }
    }, [activeConversationId, dispatch]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (messageText.trim() && activeConversationId && socket) {
            const tempMessage = {
                id: Date.now(),
                body: messageText,
                userId: currentUser.id,
                conversationId: activeConversationId,
                createdAt: new Date().toISOString(),
            };
            
            dispatch(addMessage({ conversationId: activeConversationId, message: tempMessage }));

            socket.emit('message:send', {
                convId: activeConversationId,
                body: messageText,
            });

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            socket.emit('typing:stop', { convId: activeConversationId });

            setMessageText('');
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setMessageText(value);

        if (!socket || !activeConversationId) return;

        if (value && !typingTimeoutRef.current) {
             socket.emit('typing:start', { convId: activeConversationId });
        }
       
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('typing:stop', { convId: activeConversationId });
            typingTimeoutRef.current = null;
        }, 1000);
    };
    
    if (!activeConversation) {
        return (
            <main className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-white/30 to-slate-50/30 dark:from-slate-800/30 dark:to-slate-900/30">
                <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25">
                        <MessageCircle className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Hoş geldiniz!</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md">
                        Sohbet etmeye başlamak için sol taraftan bir konuşma seçin veya yeni bir sohbet başlatın.
                    </p>
                </div>
            </main>
        );
    }

  return (
    <main className="flex-1 flex flex-col bg-gradient-to-b from-white/30 to-slate-50/30 dark:from-slate-800/30 dark:to-slate-900/30">
      {/* Sohbet Başlığı */}
      <header className="flex items-center justify-between p-6 border-b border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Avatar className="ring-2 ring-white/50 shadow-lg">
            <AvatarImage src={activeConversation.participant.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${activeConversation.participant.username}`} alt={activeConversation.participant.username} />
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
              {activeConversation.participant.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-slate-900 dark:text-slate-100">{activeConversation.participant.username}</p>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${activeConversation.participant.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <p className={`text-sm ${activeConversation.participant.isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {activeConversation.participant.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
              </p>
              {isTyping && (
                <span className="text-sm text-blue-500 dark:text-blue-400 animate-pulse">yazıyor...</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-xl">
            <Phone className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-xl">
            <Video className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-xl">
            <MoreVertical className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </Button>
        </div>
      </header>

      {/* Mesaj Alanı */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gradient-to-b from-transparent via-white/20 to-slate-50/40 dark:via-slate-800/20 dark:to-slate-900/40">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <Avatar className="w-16 h-16 ring-4 ring-white/50 shadow-xl">
              <AvatarImage src={activeConversation.participant.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${activeConversation.participant.username}`} alt={activeConversation.participant.username} />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-lg font-bold">
                {activeConversation.participant.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {activeConversation.participant.username} ile sohbet
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Henüz mesaj yok. İlk mesajı göndererek sohbeti başlatın!
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble 
              key={msg.id} 
              text={msg.body} 
              isOwnMessage={msg.userId === currentUser.id}
              timestamp={msg.createdAt}
              sender={msg.userId !== currentUser.id ? activeConversation.participant : currentUser}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Mesaj Yazma Alanı */}
      <footer className="p-6 border-t border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
        <form className="flex items-center gap-3" onSubmit={handleSendMessage}>
          <Button variant="ghost" size="icon" className="hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-2xl">
            <Smile className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-2xl">
            <Paperclip className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </Button>
          <div className="flex-1 relative">
            <Input 
              placeholder="Bir mesaj yazın..." 
              className="pr-12 py-3 bg-white/80 dark:bg-slate-700/80 border-slate-200/60 dark:border-slate-600/60 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-200 backdrop-blur-sm"
              value={messageText}
              onChange={handleInputChange}
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!messageText.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 disabled:hover:shadow-none hover:scale-105 disabled:hover:scale-100"
            >
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </footer>
    </main>
  );
};

export default ConversationWindow;