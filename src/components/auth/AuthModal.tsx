import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LogIn, UserPlus, X, ArrowLeft, Send, Mail, Clock, RefreshCw, CheckCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [signupAwaitingVerification, setSignupAwaitingVerification] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  if (!isOpen) return null;

  // Start resend cooldown timer
  const startResendCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSuccessMessage('Password reset instructions have been sent to your email.');
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onClose();
      } else {
        // Signup with email verification
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/verify`,
          }
        });
        
        if (error) throw error;
        
        // Show verification awaiting state
        setSignupAwaitingVerification(true);
        setSuccessMessage(`Verification email sent to ${email}. Please check your inbox and click the verification link to activate your account.`);
        startResendCooldown();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || !email) return;
    
    setResendLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        }
      });

      if (error) throw error;
      
      setSuccessMessage('Verification email resent successfully! Please check your inbox.');
      startResendCooldown();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification email');
    } finally {
      setResendLoading(false);
    }
  };

  const handleBack = () => {
    setError(null);
    setSuccessMessage(null);
    setSignupAwaitingVerification(false);
    setResendCooldown(0);
    
    if (isForgotPassword) {
      setIsForgotPassword(false);
    } else if (signupAwaitingVerification) {
      setSignupAwaitingVerification(false);
      setIsLogin(false); // Go back to signup form
    } else {
      setIsLogin(!isLogin);
    }
  };

  const handleClose = () => {
    setSignupAwaitingVerification(false);
    setResendCooldown(0);
    setError(null);
    setSuccessMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {signupAwaitingVerification 
                ? 'Check Your Email'
                : isForgotPassword 
                  ? 'Reset Password'
                  : isLogin 
                    ? 'Welcome Back'
                    : 'Create Account'}
            </h2>
            <p className="text-gray-600 mt-2">
              {signupAwaitingVerification 
                ? 'We sent a verification link to your email'
                : isForgotPassword 
                  ? 'Enter your email to receive reset instructions'
                  : isLogin
                    ? 'Sign in to access your account'
                    : 'Join us to get started'}
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 text-sm">
              {successMessage}
            </div>
          )}

          {/* Email Verification Awaiting State */}
          {signupAwaitingVerification ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Mail className="h-10 w-10 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Verification Email Sent</h3>
                <p className="text-gray-600 text-sm mb-4">
                  We've sent a verification link to <strong>{email}</strong>
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Next steps:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Check your email inbox (and spam folder)</li>
                      <li>Click the verification link in the email</li>
                      <li>Return here to sign in to your account</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-yellow-800 text-sm">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span>The verification link expires in 24 hours for security.</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleResendVerification}
                  disabled={resendCooldown > 0 || resendLoading}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  {resendLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                      Sending...
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <Clock size={16} />
                      Resend in {resendCooldown}s
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      Resend Verification Email
                    </>
                  )}
                </Button>

                <button
                  onClick={handleBack}
                  className="w-full text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Back to Sign Up
                </button>
              </div>
            </div>
          ) : (
            /* Regular Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2"
                  placeholder="Enter your email"
                />
              </div>

              {!isForgotPassword && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2"
                    placeholder="Enter your password"
                  />
                </div>
              )}

              <div className="flex flex-col gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5"
                >
                  {loading ? (
                    'Processing...'
                  ) : isForgotPassword ? (
                    <>
                      <Send size={18} />
                      Send Reset Instructions
                    </>
                  ) : isLogin ? (
                    <>
                      <LogIn size={18} />
                      Sign In
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Create Account
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={handleBack}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} />
                  {isForgotPassword ? 'Back to Sign In' : isLogin ? 'Need an account? Sign up' : 'Already have an account?'}
                </button>

                {isLogin && !isForgotPassword && (
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Forgot your password?
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;