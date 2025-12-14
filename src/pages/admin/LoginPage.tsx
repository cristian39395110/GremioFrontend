import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Completá email y contraseña');
      return;
    }

    setLoading(true);

    try {
      const resp = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data?.message || 'Credenciales inválidas');
      }

      // 👉 Guardamos token
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      // 👉 Redirigimos a /admin/gremios
      navigate('/admin/gremios');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleSubmit}>
        <img
          src="/images/logo-MG.png"
          alt="Multigremial Nacional"
          className="login-logo"
        />

        <h1 className="login-title">Ingreso Administración</h1>

        {error && (
          <div style={{ color: '#c62828', marginBottom: 12, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <div className="login-field">
          <label>Email</label>
          <input
            className="login-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            disabled={loading}
            required
          />
        </div>

        <div className="login-field">
          <label>Contraseña</label>
          <input
            className="login-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            disabled={loading}
            required
          />
        </div>

        <button className="login-button" type="submit" disabled={loading}>
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>

        <div className="login-footer">
          Multigremial Nacional © {new Date().getFullYear()}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
