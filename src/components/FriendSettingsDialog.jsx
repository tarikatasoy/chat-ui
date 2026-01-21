import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, UserMinus, Check, X, Search, User, Loader2, Users } from 'lucide-react';
import { toast } from "sonner";
import apiClient from '../lib/axios';

const FriendSettingsDialog = ({ isOpen, onOpenChange }) => {
  const user = useSelector(selectCurrentUser);
  
  const [activeTab, setActiveTab] = useState("friends");
  
  // State'ler
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // Tüm kullanıcılar listesi
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Genel Veri Yükleme (Arkadaşlar, İstekler)
  const refreshMyData = async () => {
    try {
      const [friendsRes, incomingRes, outgoingRes] = await Promise.all([
        apiClient.get('/friends'),
        apiClient.get('/friends/requests/incoming'),
        apiClient.get('/friends/requests/outgoing')
      ]);

      setFriends(friendsRes.data || []);
      setRequests(incomingRes.data || []);
      setOutgoing(outgoingRes.data || []);
    } catch (error) {
      console.error("Kişisel veri yükleme hatası:", error);
    }
  };

  // Tüm Kullanıcıları Çekme (Keşfet Modu)
  const fetchAllUsers = async (query = "") => {
    setLoading(true);
    try {
      // Backend güncellendiği için query boş gitse bile liste dönecek
      const response = await apiClient.get(`/search`);
      setAllUsers(response.data || []);
    } catch (error) {
      console.error("Kullanıcı listesi hatası:", error);
      toast.error("Kullanıcılar listelenemedi.");
    } finally {
      setLoading(false);
    }
  };

  // Dialog açıldığında veya Tab değiştiğinde tetiklenir
  useEffect(() => {
    if (!isOpen) return;

    if (activeTab === 'add') {
      // "Arkadaş Ekle" sekmesindeysek tüm listeyi çek
      fetchAllUsers(searchQuery);
      // Güncel durumları bilmek için giden istekleri de yenile
      apiClient.get('/friends/requests/outgoing').then(res => setOutgoing(res.data));
    } else {
      // Diğer sekmelerdeysek arkadaşları ve istekleri çek
      refreshMyData();
    }
  }, [isOpen, activeTab]);

  // Arama inputu değiştikçe (Debounce eklenebilir, şimdilik enter veya buton ile)
  const handleSearch = () => {
    fetchAllUsers(searchQuery);
  };

  // İstek Gönderme
  const sendRequest = async (toUsername) => {
    try {
      await apiClient.post('/friends/request', { toUsername });
      toast.success(`${toUsername} kullanıcısına istek gönderildi`);
      
      // Bekleyen istekleri güncelle ki buton durumu değişsin
      const response = await apiClient.get('/friends/requests/outgoing');
      setOutgoing(response.data);
    } catch (error) {
      const errMsg = error.response?.data?.error || "İstek gönderilemedi";
      toast.error(errMsg);
    }
  };

  // İstek Kabul
  const acceptRequest = async (id) => {
    try {
      await apiClient.post(`/friends/request/${id}/accept`);
      toast.success("İstek kabul edildi");
      refreshMyData();
    } catch (error) {
      toast.error("İşlem başarısız");
    }
  };

  // İstek Red
  const declineRequest = async (id) => {
    try {
      await apiClient.post(`/friends/request/${id}/decline`);
      refreshMyData();
    } catch (error) {
      toast.error("Hata oluştu");
    }
  };

  // Arkadaş Çıkarma
  const removeFriend = async (friendId) => {
    if(!confirm("Emin misiniz?")) return;
    try {
      await apiClient.delete(`/friends/${friendId}`);
      toast.success("Çıkarıldı");
      refreshMyData();
    } catch (error) {
      toast.error("Hata oluştu");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Sosyal
          </DialogTitle>
          <DialogDescription>
            Arkadaşlarını yönet veya yeni insanlar keşfet.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="friends" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col mt-2 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 mb-4 shrink-0">
            <TabsTrigger value="friends">Arkadaşlar</TabsTrigger>
            <TabsTrigger value="requests">
              İstekler {requests.length > 0 && <span className="ml-1 text-xs bg-blue-500 text-white px-1.5 rounded-full">{requests.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="add">Keşfet</TabsTrigger>
          </TabsList>

          {/* TAB 1: ARKADAŞLARIM */}
          <TabsContent value="friends" className="flex-1 overflow-y-auto pr-2 space-y-2">
            {friends.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <User className="w-12 h-12 mb-2 opacity-20" />
                <p>Listen boş.</p>
              </div>
            ) : (
              friends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${friend.username}`} />
                      <AvatarFallback>{friend.username[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{friend.username}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFriend(friend.id)} className="text-red-500 hover:bg-red-50">
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </TabsContent>

          {/* TAB 2: İSTEKLER */}
          <TabsContent value="requests" className="flex-1 overflow-y-auto pr-2 space-y-4">
             {/* Gelenler */}
             {requests.length > 0 && (
               <div>
                 <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-semibold">Gelen İstekler</h4>
                 <div className="space-y-2">
                   {requests.map((req) => (
                     <div key={req.id} className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                       <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                           <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${req.requester.username}`} />
                           <AvatarFallback>?</AvatarFallback>
                         </Avatar>
                         <span className="font-medium text-sm">{req.requester.username}</span>
                       </div>
                       <div className="flex gap-1">
                         <Button size="sm" className="h-8 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => acceptRequest(req.id)}>
                           Kabul Et
                         </Button>
                         <Button size="sm" variant="ghost" className="h-8 text-red-500 hover:bg-red-50" onClick={() => declineRequest(req.id)}>
                           Reddet
                         </Button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
            
             {/* Gidenler */}
             <div>
               <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2 mt-2 font-semibold">Bekleyen İsteklerin</h4>
               {outgoing.length === 0 ? <p className="text-xs text-slate-400 italic">Bekleyen isteğin yok.</p> : (
                 <div className="space-y-2">
                  {outgoing.map((req) => {
                    const targetUser = req.userAId === user?.id ? req.userB : req.userA;
                    return (
                      <div key={req.id} className="flex items-center justify-between p-2 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                         <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{targetUser?.username?.[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-slate-600 dark:text-slate-300">{targetUser?.username}</span>
                         </div>
                         <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Bekliyor</span>
                      </div>
                    );
                  })}
                 </div>
               )}
             </div>
          </TabsContent>

          {/* TAB 3: KEŞFET (Tüm Kullanıcılar) */}
          <TabsContent value="add" className="flex-1 flex flex-col mt-0 overflow-hidden">
            {/* Arama Barı */}
            <div className="flex gap-2 mb-4 shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Kullanıcı ara..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    // İsteğe bağlı: Yazarken otomatik arama için buraya fetchAllUsers(e.target.value) eklenebilir
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={loading} variant="secondary">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Filtrele'}
              </Button>
            </div>

            {/* Kullanıcı Listesi */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {loading && allUsers.length === 0 ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-500" /></div>
              ) : (
                allUsers.map((resUser) => {
                  // Durum kontrolü
                  const isPending = outgoing.some(o => o.userAId === resUser.id || o.userBId === resUser.id);
                  const isFriend = friends.some(f => f.id === resUser.id);
                  // Gelen istek var mı kontrolü (Opsiyonel ama şık olur)
                  const hasIncoming = requests.some(r => r.requester.id === resUser.id);

                  return (
                    <div key={resUser.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                       <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${resUser.username}`} />
                            <AvatarFallback>{resUser.username[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{resUser.username}</span>
                            <span className="text-xs text-slate-400">Kullanıcı</span>
                          </div>
                       </div>

                       {/* Buton Durumları */}
                       {isFriend ? (
                         <Button size="sm" variant="ghost" disabled className="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20">
                           <Check className="h-4 w-4 mr-1" /> Arkadaş
                         </Button>
                       ) : isPending ? (
                         <Button size="sm" variant="ghost" disabled className="text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20">
                           <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Bekliyor
                         </Button>
                       ) : hasIncoming ? (
                         <Button size="sm" className="bg-blue-500" onClick={() => setActiveTab("requests")}>
                           İsteği Gör
                         </Button>
                       ) : (
                         <Button size="sm" onClick={() => sendRequest(resUser.username)}>
                           <UserPlus className="h-4 w-4 mr-2" />
                           Ekle
                         </Button>
                       )}
                    </div>
                  );
                })
              )}
              
              {!loading && allUsers.length === 0 && (
                 <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                    <Users className="h-10 w-10 mb-2 opacity-20" />
                    <p>Kullanıcı bulunamadı.</p>
                 </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FriendSettingsDialog;