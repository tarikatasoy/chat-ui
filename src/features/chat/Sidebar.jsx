// src/features/chat/Sidebar.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, Search, Plus, Settings, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchConversations, selectAllConversations, setActiveConversation, selectActiveConversationId } from './chatSlice';
import { logOut, selectCurrentUser } from '../auth/authSlice';
import FriendSettingsDialog from '@/components/FriendSettingsDialog';

const ConversationItem = ({ conversation, onSelect, isActive }) => {
  const { participant, lastMessage } = conversation;
  const statusColor = participant.isOnline ? 'bg-emerald-500' : 'bg-slate-400';

  return (
    <div 
        className={`group flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
          isActive 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
            : 'hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-md'
        }`}
        onClick={() => onSelect(conversation.id)}
    >
      <div className="relative">
        <Avatar className={`transition-all duration-200 ${isActive ? 'ring-2 ring-white/50' : 'group-hover:ring-2 group-hover:ring-blue-500/30'}`}>
          <AvatarImage src={participant.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${participant.username}`} alt={participant.username} />
          <AvatarFallback className={isActive ? 'bg-white/20 text-white' : 'bg-gradient-to-br from-blue-400 to-purple-500 text-white'}>
            {participant.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className={`absolute -bottom-0.5 -right-0.5 block h-4 w-4 rounded-full ${statusColor} ring-2 ring-white dark:ring-slate-900 shadow-sm`} />
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <p className={`font-semibold truncate ${isActive ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
            {participant.username}
          </p>
          {lastMessage && (
            <span className={`text-xs ${isActive ? 'text-white/70' : 'text-slate-500'}`}>
              {new Date(lastMessage.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <p className={`text-sm truncate ${isActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
          {lastMessage?.body || 'Henüz mesaj yok'}
        </p>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const dispatch = useDispatch();
  const conversations = useSelector(selectAllConversations);
  const user = useSelector(selectCurrentUser);
  const activeConversationId = useSelector(selectActiveConversationId);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const handleConversationSelect = (id) => {
    dispatch(setActiveConversation(id));
  };

  const handleLogout = () => {
      dispatch(logOut());
  }

  const filteredConversations = conversations.filter(conv =>
    conv.participant.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-[380px] flex flex-col bg-gradient-to-b from-white/50 to-slate-50/50 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-sm border-r border-slate-200/60 dark:border-slate-700/60">
      <FriendSettingsDialog 
        isOpen={isSettingsOpen} 
        onOpenChange={setIsSettingsOpen} 
      />
      {/* Header: Kullanıcı Bilgisi ve Çıkış */}
      <header className="p-6 border-b border-slate-200/60 dark:border-slate-700/60 bg-white/30 dark:bg-slate-800/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="ring-2 ring-gradient-to-r from-blue-400 to-purple-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900">
                <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.username}`} alt={user?.username} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {user?.username?.substring(0,2).toUpperCase() || 'KV'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">{user?.username || 'Kullanıcı Adı'}</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Çevrimiçi
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {/* GÜNCELLENDİ: Settings butonu onClick */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSettingsOpen(true)} 
                className="hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-xl"
              >
                <Settings className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </Button>

              <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl">
                <LogOut className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
      </header>

      {/* Arama Çubuğu */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Sohbet ara..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 pr-4 py-3 bg-white/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-200 backdrop-blur-sm"
          />
        </div>
        <Button onClick={() => setIsSettingsOpen(true)} className="w-full mt-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl py-3 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 hover:scale-[1.02]">
          <Plus className="h-4 w-4 mr-2" />
          Yeni Sohbet
        </Button>
      </div>

      {/* Sohbet Listesi */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-2">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <ConversationItem 
                key={conv.id} 
                conversation={conv} 
                onSelect={handleConversationSelect}
                isActive={conv.id === activeConversationId}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="h-12 w-12 text-slate-400 mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {searchQuery ? 'Sohbet bulunamadı' : 'Henüz sohbet yok'}
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                {searchQuery ? 'Arama teriminizi değiştirin' : 'Yeni bir sohbet başlatın'}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;