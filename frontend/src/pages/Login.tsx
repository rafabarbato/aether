import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-aether-bg-primary">
      <div className="bg-aether-bg-secondary border border-aether-border-elevated p-8 max-w-md w-full">
        {/* Logo/Header */}
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-3xl font-bold text-aether-text-primary uppercase tracking-wider">
            AETHER
          </h1>
        </div>

        <div className="mb-6">
          <div className="h-0.5 bg-aether-border-primary mb-4"></div>
          <p className="text-aether-text-muted font-sans text-[10px] uppercase tracking-widest text-center">
            Task Management Platform
          </p>
        </div>

        {error && (
          <div className="bg-aether-accent-danger bg-opacity-10 border border-aether-accent-danger px-4 py-3 mb-6">
            <p className="text-aether-accent-danger font-sans text-xs uppercase tracking-wider">
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-aether-text-muted font-sans text-[10px] font-bold uppercase tracking-widest mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-aether-bg-elevated border border-aether-border-elevated text-aether-text-primary font-mono text-sm focus:outline-none focus:border-aether-blue-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-aether-text-muted font-sans text-[10px] font-bold uppercase tracking-widest mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-aether-bg-elevated border border-aether-border-elevated text-aether-text-primary font-mono text-sm focus:outline-none focus:border-aether-blue-primary transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-aether-blue-primary hover:bg-aether-blue-dark text-white font-sans text-xs font-bold uppercase tracking-wider py-3 px-4 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isLoading ? 'AUTHENTICATING...' : 'LOGIN'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-aether-border-primary">
          <p className="text-aether-text-muted font-sans text-[10px] uppercase tracking-widest text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-aether-blue-primary hover:text-aether-blue-light transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
