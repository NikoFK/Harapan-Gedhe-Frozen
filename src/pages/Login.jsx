import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3001/api/login', {
        email,
        password,
      });

      const { success, user, message } = response.data;

      if (success && user.role === 'customer') {
        localStorage.setItem('user', JSON.stringify(user)); // simpan
        onLoginSuccess(user);
        alert(`Selamat datang Customer, ${user.username}!`);
        navigate('/');
      }if (success && user.role === 'admin') {
        localStorage.setItem('user', JSON.stringify(user)); // simpan
        onLoginSuccess(user);
        alert(`Selamat datang Admin, ${user.username}!`);
        navigate('/');
      } if (success && user.role === 'supplier') {
        localStorage.setItem('user', JSON.stringify(user)); // simpan
        onLoginSuccess(user);
        alert(`Selamat datang Supplier, ${user.username}!`);
        navigate('/');
      } 
      else {
        // alert(message || 'Login gagal!');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Terjadi kesalahan saat login.');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="mb-4 text-center">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">Login</button>
      </form>
      <div className="mt-3 text-center">
        <small>Don't have an account? <a href="/register">Register</a></small>
      </div>
    </div>
  );
}

export default Login;
