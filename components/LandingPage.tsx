import React, { useState, useRef, useEffect } from 'react';
import { HexagonCursor } from './HexagonCursor';
import { Button } from './Button';

interface Props {
  onLogin: (username: string) => void;
  logoUrl?: string | null;
}

export const LandingPage: React.FC<Props> = ({ onLogin, logoUrl }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpLoading, setSignUpLoading] = useState(false);
  
  // 3D Tilt State
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / 40;
      const y = (e.clientY - innerHeight / 2) / 40;
      
      setRotation({ x: -y, y: x });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return; 
    
    setIsLoading(true);
    setError(false);

    setTimeout(() => {
      setIsLoading(false);
      
      if (username.toLowerCase() === 'admin' && password === 'password') {
        onLogin(username);
      } else {
        setError(true);
        setPassword('');
        if (navigator.vibrate) navigator.vibrate(200);
      }
    }, 1200);
  };

  const handleGoogleSignUp = async () => {
    setSignUpLoading(true);
    
    try {
      // Google OAuth implementation
      const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
      const params = {
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id',
        redirect_uri: `${window.location.origin}/auth/callback`,
        response_type: 'code',
        scope: 'openid email profile',
        state: 'google_signup', // Differentiate from login
        prompt: 'select_account',
      };
      
      const queryString = new URLSearchParams(params).toString();
      window.location.href = `${googleAuthUrl}?${queryString}`;
      
    } catch (err) {
      console.error('Google sign up failed:', err);
      setError(true);
    } finally {
      setSignUpLoading(false);
    }
  };

  const handleEmailSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpEmail) return;
    
    setSignUpLoading(true);
    
    // Simulate email verification process
    setTimeout(() => {
      setSignUpLoading(false);
      alert(`Verification email sent to ${signUpEmail}. Please check your inbox.`);
      setShowSignUp(false);
      setSignUpEmail('');
    }, 1500);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FBFBFD] perspective-[2000px]">
      <HexagonCursor />
      
      <div 
        ref={cardRef}
        className="relative z-10 w-full max-w-[420px] px-6 animate-fade-in transition-transform duration-100 ease-out will-change-transform"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        <div className="glass-panel rounded-[32px] p-10 shadow-2xl shadow-blue-900/5 backdrop-blur-3xl border border-white/50">
          <div className="flex flex-col items-center mb-10 transform translate-z-10">
            {logoUrl ? (
              <img src={logoUrl} alt="MediVision Logo" className="w-20 h-20 rounded-2xl shadow-lg shadow-blue-500/20 mb-6 object-cover" />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-[#0071e3] to-[#0077ED] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/30 mb-6">
                M
              </div>
            )}
            
            <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">
              MediVision
            </h1>
            <p className="text-[#86868b] text-sm mt-2 text-center leading-relaxed">
              Professional Medication Reconciliation System
            </p>
          </div>

          {!showSignUp ? (
            // Login Form
            <form onSubmit={handleLogin} className="space-y-5">
              <div className={`space-y-4 transition-all duration-300 ${error ? 'translate-x-[-5px] translate-x-[5px] animate-pulse' : ''}`}>
                <div className="group">
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Username
                  </label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(false); }}
                    className={`w-full bg-[#F5F5F7] border rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 transition-all duration-300 font-medium ${error ? 'border-red-300 focus:ring-red-100' : 'border-transparent focus:ring-[#0071e3]/30'}`}
                    placeholder="Enter Username (admin)"
                    required
                  />
                </div>
                <div className="group">
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Password
                  </label>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(false); }}
                    className={`w-full bg-[#F5F5F7] border rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 transition-all duration-300 font-medium ${error ? 'border-red-300 focus:ring-red-100' : 'border-transparent focus:ring-[#0071e3]/30'}`}
                    placeholder="•••••••• (password)"
                    required
                  />
                </div>
              </div>
              
              {error && (
                <p className="text-red-500 text-xs text-center font-medium animate-fade-in">
                  Invalid credentials. Please try again.
                </p>
              )}

              <div className="pt-2 space-y-3">
                <Button 
                  type="submit" 
                  className={`w-full h-12 text-[15px] font-medium tracking-wide shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 transform active:scale-[0.98] ${error ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : ''}`}
                  isLoading={isLoading}
                >
                  {error ? 'Try Again' : 'Sign In'}
                </Button>
                
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-xs font-medium">OR</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <Button 
                  type="button"
                  variant="secondary"
                  onClick={() => setShowSignUp(true)}
                  className="w-full h-12 text-[15px] font-medium border border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                  Create Account
                </Button>
              </div>
            </form>
          ) : (
            // Sign Up Form
            <div className="space-y-5">
              <div className="text-center mb-2">
                <h2 className="text-lg font-semibold text-[#1D1D1F]">Create Account</h2>
                <p className="text-gray-500 text-sm mt-1">Join MediVision today</p>
              </div>

              <Button 
                type="button"
                onClick={handleGoogleSignUp}
                isLoading={signUpLoading}
                className="w-full h-12 text-[15px] font-medium bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign up with Google
              </Button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs font-medium">OR</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="group">
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Email Address
                  </label>
                  <input 
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full bg-[#F5F5F7] border border-transparent rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#0071e3]/30 transition-all duration-300 font-medium"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="pt-2 space-y-3">
                  <Button 
                    type="submit"
                    isLoading={signUpLoading}
                    className="w-full h-12 text-[15px] font-medium tracking-wide shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30"
                  >
                    Send Verification Email
                  </Button>

                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={() => setShowSignUp(false)}
                    className="w-full h-12 text-[15px] font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  >
                    Back to Sign In
                  </Button>
                </div>
              </form>
            </div>
          )}
          
          <div className="mt-8 text-center">
            <p className="text-[10px] text-gray-400 font-medium tracking-wide">
              AUTHORIZED PERSONNEL ONLY • HIPAA COMPLIANT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};