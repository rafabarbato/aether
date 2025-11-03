import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(formData);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-aether-bg-primary">
      <div className="bg-aether-bg-secondary border border-aether-border-elevated p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-3xl font-bold text-aether-text-primary uppercase tracking-wider">
            AETHER
          </h1>
        </div>

        <div className="mb-6">
          <div className="h-0.5 bg-aether-border-primary mb-4"></div>
          <p className="text-aether-text-muted font-sans text-[10px] uppercase tracking-widest text-center">
            Create New Account
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
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-aether-bg-elevated border border-aether-border-elevated text-aether-text-primary font-mono text-sm focus:outline-none focus:border-aether-blue-primary transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-aether-text-muted font-sans text-[10px] font-bold uppercase tracking-widest mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-aether-bg-elevated border border-aether-border-elevated text-aether-text-primary font-mono text-sm focus:outline-none focus:border-aether-blue-primary transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-aether-text-muted font-sans text-[10px] font-bold uppercase tracking-widest mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-aether-bg-elevated border border-aether-border-elevated text-aether-text-primary font-mono text-sm focus:outline-none focus:border-aether-blue-primary transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-aether-text-muted font-sans text-[10px] font-bold uppercase tracking-widest mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-aether-bg-elevated border border-aether-border-elevated text-aether-text-primary font-mono text-sm focus:outline-none focus:border-aether-blue-primary transition-colors"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-aether-blue-primary hover:bg-aether-blue-dark text-white font-sans text-xs font-bold uppercase tracking-wider py-3 px-4 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isLoading ? 'CREATING ACCOUNT...' : 'REGISTER'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-aether-border-primary">
          <p className="text-aether-text-muted font-sans text-[10px] uppercase tracking-widest text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-aether-blue-primary hover:text-aether-blue-light transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
