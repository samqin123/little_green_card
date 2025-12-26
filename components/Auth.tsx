
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Sprout, Mail, Lock, Loader2, AlertCircle, ArrowRight, CheckCircle2, ChevronLeft } from 'lucide-react';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Google 登录失败');
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      if (isSignUp) {
        console.log("Attempting sign up for:", email);
        const { data, error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        
        if (signUpError) throw signUpError;
        
        console.log("Sign up response:", data);
        // Supabase 如果配置了验证邮件，data.user 存在但 data.session 为空
        setIsSuccess(true);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      console.error("Auth error detail:", err);
      setError(err.message || '认证失败，请检查网络或账号信息');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-center text-white relative">
          <div className="inline-flex bg-white/20 p-4 rounded-2xl mb-4 backdrop-blur-sm shadow-inner">
            <Sprout className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">小绿卡 - 基因科普指引</h1>
          <p className="text-emerald-50 opacity-90 text-sm mt-2 font-medium">AI 驱动的肿瘤基因智能助手</p>
        </div>

        <div className="p-8 bg-white">
          {isSuccess ? (
            <div className="text-center space-y-6 animate-in slide-in-from-bottom-4">
              <div className="flex justify-center">
                <div className="bg-emerald-100 p-6 rounded-full">
                  <CheckCircle2 className="w-16 h-16 text-emerald-600 animate-bounce" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">请查收验证邮件</h2>
                <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                  我们已向 <span className="font-semibold text-emerald-600">{email}</span> 发送了一封激活邮件。<br/>
                  请点击邮件中的链接完成注册。
                </p>
                <p className="text-[11px] text-slate-400 mt-4 italic">
                  提示：如果收件箱没有，请检查“垃圾邮件”分类。
                </p>
              </div>
              <button
                onClick={() => { setIsSuccess(false); setIsSignUp(false); }}
                className="w-full py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                返回登录界面
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Google Auth Button */}
              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-3.5 px-4 border-2 border-slate-100 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                <span className="text-sm font-bold text-slate-700">使用 Google 账号继续</span>
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">或使用邮箱</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      placeholder="电子邮箱"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 placeholder:text-slate-400 font-medium transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      placeholder="密码 (至少6位)"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 placeholder:text-slate-400 font-medium transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm border border-red-100 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {isSignUp ? '免费注册' : '立即登录'}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="pt-4 text-center">
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                    className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors text-sm"
                  >
                    {isSignUp ? '已有账号？点击返回登录' : '没有账号？点击注册新用户'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-tighter">
              Medical Science Popularization Tool • Powered by Gemini AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
