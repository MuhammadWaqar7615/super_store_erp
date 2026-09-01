import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CustomerAuth = () => {
  const [activeTab, setActiveTab] = useState('login');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register State
  const [regData, setRegData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', address: '', otp: '' });
  
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [otpTimer, setOtpTimer] = useState(0);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // If navigated directly to /auth?tab=register, start on the register tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'register') {
      setActiveTab('register');
    }
  }, [location]);

  useEffect(() => {
    let interval;
    if (wizardStep === 3 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [wizardStep, otpTimer]);

  const handleRegChange = (e) => {
    let { name, value } = e.target;
    
    // Prevent typing letters in phone field
    if (name === 'phone') {
      value = value.replace(/[^\d+ \-()]/g, '');
    }
    
    setRegData({ ...regData, [name]: value });
  };

  const switchTab = (tab) => {
    setError('');
    setActiveTab(tab);
    if (tab === 'register') setWizardStep(1);
    navigate(`/auth?tab=${tab}`, { replace: true });
  };

  const handleNextStep = () => {
    setError('');
    if (!regData.name || !regData.phone) {
      return setError('Please fill in Name and Phone Number');
    }
    const cleanPhone = regData.phone.replace(/[\s\-()]/g, '');
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return setError('Please provide a valid phone number (10-15 digits)');
    }
    setWizardStep(2);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/customer-auth/login', { email: loginEmail, password: loginPassword });
      login(data.data, data.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/customer-auth/send-otp', { email: regData.email });
      setOtpTimer(60);
      setWizardStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (wizardStep === 2) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(regData.email)) {
        return setError('Please provide a valid email address');
      }
      if (regData.password.length < 8) {
        return setError('Password must be at least 8 characters long');
      }
      if (regData.password !== regData.confirmPassword) {
        return setError('Passwords do not match');
      }
      return handleSendOtp();
    }

    if (wizardStep === 3) {
      if (!/^\d{6}$/.test(regData.otp)) {
        return setError('OTP must be exactly 6 digits');
      }
      setLoading(true);
      try {
        const { data } = await api.post('/customer-auth/register', regData);
        login(data.data, data.data.token);
        navigate('/');
      } catch (err) {
        setError(err.response?.data?.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Super Store
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Customer Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/5 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/10 transition-all duration-300">
          
          {/* Tabs */}
          <div className="flex mb-6 border-b border-white/10">
            <button
              type="button"
              className={`flex-1 pb-3 text-center text-sm font-medium transition-colors ${
                activeTab === 'login' 
                  ? 'border-b-2 border-purple-500 text-white' 
                  : 'text-slate-400 hover:text-slate-300'
              }`}
              onClick={() => switchTab('login')}
            >
              Log in
            </button>
            <button
              type="button"
              className={`flex-1 pb-3 text-center text-sm font-medium transition-colors ${
                activeTab === 'register' 
                  ? 'border-b-2 border-purple-500 text-white' 
                  : 'text-slate-400 hover:text-slate-300'
              }`}
              onClick={() => switchTab('register')}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm text-red-200 text-center animate-pulse">
              {error}
            </div>
          )}

          {activeTab === 'login' ? (
            <form className="space-y-5" onSubmit={handleLoginSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors pr-10"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300 focus:outline-none"
                  >
                    {showLoginPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Authenticating...' : 'Sign in'}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleRegisterSubmit}>
              {/* Wizard Progress Indicator */}
              <div className="flex items-center justify-between mb-6 px-2">
                <div className={`text-sm font-medium ${wizardStep === 1 ? 'text-purple-400' : 'text-slate-400'}`}>1. Personal Info</div>
                <div className="flex-1 border-t border-white/20 mx-4"></div>
                <div className={`text-sm font-medium ${wizardStep === 2 ? 'text-purple-400' : 'text-slate-400'}`}>2. Account Details</div>
              </div>

              {wizardStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                    <input type="text" name="name" required maxLength={50} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors" placeholder="John Doe" value={regData.name} onChange={handleRegChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                    <input type="text" name="phone" required maxLength={20} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors" placeholder="+92 300 0000000" value={regData.phone} onChange={handleRegChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Address (Optional)</label>
                    <input type="text" name="address" maxLength={200} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors" placeholder="123 Main St" value={regData.address} onChange={handleRegChange} />
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 transition-all mt-6"
                  >
                    Next Step &rarr;
                  </button>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                    <input type="email" name="email" required maxLength={100} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors" placeholder="you@example.com" value={regData.email} onChange={handleRegChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                    <div className="relative">
                      <input type={showRegPassword ? "text" : "password"} name="password" required maxLength={100} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors pr-10" placeholder="••••••••" value={regData.password} onChange={handleRegChange} />
                      <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300 focus:outline-none">
                        {showRegPassword ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Confirm Password</label>
                    <div className="relative">
                      <input type={showRegConfirmPassword ? "text" : "password"} name="confirmPassword" required maxLength={100} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors pr-10" placeholder="••••••••" value={regData.confirmPassword} onChange={handleRegChange} />
                      <button type="button" onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300 focus:outline-none">
                        {showRegConfirmPassword ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="w-1/3 flex justify-center py-2.5 px-4 border border-white/20 rounded-lg shadow-sm text-sm font-semibold text-slate-300 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 transition-all"
                    >
                      &larr; Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-2/3 flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Sending OTP...' : 'Next Step \u2192'}
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <h3 className="text-lg font-medium text-white">Check your email</h3>
                    <p className="text-sm text-slate-400 mt-1">We've sent a 6-digit code to <span className="font-semibold text-slate-200">{regData.email}</span></p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Verification Code</label>
                    <input type="text" name="otp" required maxLength={6} className="w-full text-center tracking-[1em] font-mono text-xl bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors" placeholder="------" value={regData.otp} onChange={handleRegChange} />
                  </div>
                  
                  <div className="flex flex-col items-center space-y-4 mt-6">
                    <button
                      type="submit"
                      disabled={loading || regData.otp.length !== 6}
                      className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Verifying...' : 'Verify & Register'}
                    </button>

                    <div className="text-sm text-slate-400">
                      {otpTimer > 0 ? (
                        <span>Resend code in <span className="text-purple-400 font-medium">{otpTimer}s</span></span>
                      ) : (
                        <button type="button" onClick={handleSendOtp} disabled={loading} className="text-purple-400 hover:text-purple-300 font-medium disabled:opacity-50 transition-colors">
                          Resend Code
                        </button>
                      )}
                    </div>

                    <button type="button" onClick={() => setWizardStep(2)} className="text-sm text-slate-500 hover:text-slate-400 transition-colors">
                      &larr; Back to Email
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerAuth;
