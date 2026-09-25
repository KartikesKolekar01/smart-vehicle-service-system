import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound, Send } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Input from '../components/Input';
import Button from '../components/Button';
import ThemeToggle from '../components/ThemeToggle';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosClient.post('/api/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset instructions sent to your email');
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
            <KeyRound size={32} />
          </div>
          <h1 className="text-4xl font-bold mb-4">Forgot Password?</h1>
          <p className="text-white/80 text-lg leading-relaxed">
            No worries! Enter your email and we'll send you instructions to reset your password.
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

          {!sent ? (
            <>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Reset Password
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                Enter your registered email address
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Button type="submit" loading={loading} className="w-full" size="lg">
                  <Send size={18} /> Send Reset Instructions
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Send size={28} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Check your email!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                We've sent reset instructions to <strong>{email}</strong>.
                <br />
                <span className="text-xs text-orange-600 dark:text-orange-400">
                  (Check the Auth Service console for the mock reset token)
                </span>
              </p>

              <Button
                onClick={() => navigate('/reset-password')}
                className="w-full mb-3"
              >
                I have a reset token
              </Button>
              <Link to="/login">
                <Button variant="secondary" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}