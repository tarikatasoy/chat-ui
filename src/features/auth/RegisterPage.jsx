// src/features/auth/RegisterPage.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials } from './authSlice';
import apiClient from '../../lib/axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User, MessageCircle, Sparkles, UserPlus } from 'lucide-react';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await apiClient.post('/auth/register', { username, email, password });
      const { token, user } = response.data;
      dispatch(setCredentials({ user, token }));
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt başarısız oldu.');
      console.error('Kayıt başarısız:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-r from-pink-400 to-rose-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-rose-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-md relative backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-700/50 shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 -rotate-3 hover:rotate-0 transition-transform duration-300">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Hemen Başla
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
              Yeni bir hesap oluşturarak sohbet dünyasına katılın
            </CardDescription>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  {error}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Kullanıcı Adı
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  id="username" 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="kullaniciadim" 
                  required 
                  className="pl-10 py-3 bg-white/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 dark:focus:border-purple-500 transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email Adresi
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="ornek@email.com" 
                  required 
                  className="pl-10 py-3 bg-white/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 dark:focus:border-purple-500 transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Şifre
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="pl-10 pr-10 py-3 bg-white/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 dark:focus:border-purple-500 transition-all duration-200"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-lg"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
                </Button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                En az 6 karakter uzunluğunda olmalıdır
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Hesap oluşturuluyor...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Kayıt Ol
                </div>
              )}
            </Button>
            
            <div className="flex items-center justify-center w-full">
              <div className="border-t border-slate-200 dark:border-slate-700 flex-grow"></div>
              <span className="px-4 text-sm text-slate-500 dark:text-slate-400">veya</span>
              <div className="border-t border-slate-200 dark:border-slate-700 flex-grow"></div>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
              Zaten bir hesabın var mı?{' '}
              <Link to="/login" className="font-semibold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
                Giriş Yap
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage;