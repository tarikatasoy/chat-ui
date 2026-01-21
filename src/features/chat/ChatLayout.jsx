// src/features/chat/ChatLayout.jsx
import Sidebar from './Sidebar';
import ConversationWindow from './ConversationWindow';
import { SocketProvider } from '../../context/SocketContext';

const ChatLayout = () => {
  return (
    <SocketProvider>
      <div className="flex h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 overflow-hidden">
        <div className="flex w-full h-full backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-700/50 rounded-none md:rounded-2xl md:m-4 md:h-[calc(100vh-2rem)] shadow-2xl">
          <Sidebar />
          <ConversationWindow />
        </div>
      </div>
    </SocketProvider>
  );
};

export default ChatLayout;