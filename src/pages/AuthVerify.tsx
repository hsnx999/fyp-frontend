import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, LogIn, Mail, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';

const AuthVerify: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const type = searchParams.get('type');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Add a small delay to show loading state
    setTimeout(() => {
      if (type === 'signup' && !error) {
        setMessage('Your email has been successfully verified! You can now sign in to your account.');
        setIsSuccess(true);
      } else if (error === 'access_denied') {
        setMessage('Email verification failed. The link may have expired or is invalid. Please try registering again or request a new verification email.');
        setIsSuccess(false);
      } else if (errorDescription) {
        setMessage(`Verification failed: ${errorDescription.replace(/\+/g, ' ')}. Please try again or request a new verification email.`);
        setIsSuccess(false);
      } else if (error) {
        setMessage('Email verification failed. The verification link may be invalid or expired.');
        setIsSuccess(false);
      } else {
        setMessage('Processing email verification...');
        setIsSuccess(false);
      }
      setIsLoading(false);
    }, 1000);
  }, [searchParams]);

  const handleGoToLogin = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Verifying Email</h2>
          <p className="text-gray-600">Please wait while we verify your email address...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        
        {isSuccess ? (
          <>
            <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Email Verified Successfully!</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center text-green-700 text-sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>Your account is now active and ready to use</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Verification Failed</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start text-red-700 text-sm">
                <Clock className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-medium mb-1">Common reasons for verification failure:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Verification link has expired (24-hour limit)</li>
                    <li>• Link has already been used</li>
                    <li>• Email was forwarded or modified</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        <Button 
          onClick={handleGoToLogin} 
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105"
        >
          <LogIn size={20} />
          {isSuccess ? 'Sign In to Your Account' : 'Back to Login'}
        </Button>

        {!isSuccess && (
          <p className="text-gray-500 text-sm mt-4">
            Need help? Try registering again with a fresh email verification.
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthVerify;