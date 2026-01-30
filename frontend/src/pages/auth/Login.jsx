import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';

export default function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    await login(data.email, data.password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12 px-4 sm:px-6 lg:px-8 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-md w-full space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-primary-600">
              Manufacturing ERP
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Production, quality, and logistics in one place.</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-x-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Sign in</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Use your work email to continue.</p>
          <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="input"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="input"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6 rounded-lg border border-slate-200/60 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Demo Credentials</p>
            <div className="mt-2 space-y-1">
              <p>Admin: admin@example.com / Admin@123</p>
              <p>Sales: sales@example.com / Sales@123</p>
              <p>Production: production@example.com / Prod@123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 