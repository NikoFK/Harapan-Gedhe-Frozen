// src/pages/Guestbook.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Guestbook() {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState('');
  const [user, setUser] = useState(null); // Assume user info is stored in localStorage or session
  const navigate = useNavigate();

  const fetchEntries = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/guestbook');
      setEntries(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser?.role !== 'customer') {
        navigate('/');
      alert('Hanya customer yang bisa mengakses halaman ini.');
    } else {
      setUser(storedUser);
      fetchEntries();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newEntry.trim()) return;
    try {
      await axios.post('http://localhost:3001/api/guestbook', {
        name: user.username,
        message: newEntry,
      });
      setNewEntry('');
      fetchEntries();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container my-4">
        <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left"></i> Kembali
      </button>
      <h2>Buku Tamu</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-2">
          <div className="col-md-10">
            <input
              type="text"
              className="form-control"
              placeholder="Tulis pesanmu di sini..."
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              required
            />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary w-100">
              Kirim
            </button>
          </div>
        </div>
      </form>
      <ul className="list-group">
        {entries.map((entry) => (
          <li key={entry.id} className="list-group-item">
            <strong>{entry.name}</strong> ({new Date(entry.created_at).toLocaleString()}):<br />
            {entry.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Guestbook;
