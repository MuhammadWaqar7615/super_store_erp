import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await axios.post(`${API_URL}/customer-auth/verify-otp`, { email, otp });
      setSuccessMsg('Account verified! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccessMsg('');
    setResendLoading(true);
    try {
      await axios.post(`${API_URL}/customer-auth/resend-otp`, { email });
      setSuccessMsg('A new OTP has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl transition-all duration-300">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a 6-digit code to <span className="font-semibold text-gray-800">{email}</span>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm text-center font-medium">
              {successMsg}
            </div>
          )}
          <div>
            <label htmlFor="otp" className="sr-only">6-digit OTP</label>
            <input id="otp" name="otp" type="text" required maxLength="6" minLength="6"
              className="appearance-none rounded-lg text-center tracking-[0.5em] font-mono text-2xl relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 transition-all"
              placeholder="------" value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} />
          </div>

          <div>
            <button type="submit" disabled={loading || otp.length !== 6}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <button onClick={handleResend} disabled={resendLoading}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors disabled:opacity-50">
            {resendLoading ? 'Sending...' : "Didn't receive a code? Resend"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
