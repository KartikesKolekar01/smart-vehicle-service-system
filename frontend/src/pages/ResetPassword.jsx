import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, KeyRound, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import ThemeToggle from '../components/ThemeToggle';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      await axiosClient.post('/api/auth/reset-password', {
        token,
        newPassword,
      });
      setDone(true);
      toast.success('Password reset successful!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      <div className="hidden lg:flex lg:w-1/2 gradient-bg items-center justify-center p-12">
        <div className="text-white max-w-md">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
            <Lock size={32} />
          </div>
          <h1 className="text-4xl font-bold mb-4">Set New Password</h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Choose a strong password with at least 8 characters, including uppercase, lowercase, number, and symbol.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 mb-6"
          >
            <ArrowLeft size={16} /> Back to login
          </Link>

          {!done ? (
            <>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Reset Password
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                Enter the reset token and your new password
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Reset Token"
                  type="text"
                  placeholder="Paste token from email"
                  icon={KeyRound}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />

                <div className="relative">
                  <Input
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 chars, 1 uppercase, 1 number, 1 symbol"
                    icon={Lock}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-10 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <Input
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  icon={Lock}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <Button type="submit" loading={loading} className="w-full" size="lg">
                  <CheckCircle size={18} /> Reset Password
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Password Reset!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Your password has been updated successfully. You can now login with your new password.
              </p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Go to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}