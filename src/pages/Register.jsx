import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    retypePassword: '',
    email: '',
    dob: '',
    gender: '',
    address: '',
    city: '',
    contact: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (form.password !== form.retypePassword) {
      alert('Password tidak cocok!');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:3001/api/register', {
        username: form.username,
        password: form.password,
        email: form.email,
        date_of_birth: form.dob,
        gender: form.gender,
        address: form.address,
        city: form.city,
        contact_no: form.contact,
      });
  
      if (response.data.success) {
        alert('Registrasi berhasil!');
        navigate('/login'); // ✅ Redirect ke halaman login
      } else {
        alert('Registrasi gagal: ' + response.data.message);
      }
    } catch (error) {
      console.error('Gagal registrasi:', error);
      alert('Terjadi kesalahan saat mengirim data.');
    }
  };
  

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Form Registrasi</h2>
      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Username</label>
          <input type="text" className="form-control" name="username" value={form.username} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Password</label>
          <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Retype Password</label>
          <input type="password" className="form-control" name="retypePassword" value={form.retypePassword} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Date of Birth</label>
          <input type="date" className="form-control" name="dob" value={form.dob} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Gender</label>
          <select className="form-select" name="gender" value={form.gender} onChange={handleChange} required>
            <option value="">Pilih</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>
        <div className="col-12">
          <label className="form-label">Address</label>
          <textarea className="form-control" name="address" rows="2" value={form.address} onChange={handleChange} required></textarea>
        </div>
        <div className="col-md-6">
          <label className="form-label">City</label>
          <input type="text" className="form-control" name="city" value={form.city} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Contact No</label>
          <input type="text" className="form-control" name="contact" value={form.contact} onChange={handleChange} required />
        </div>
        <div className="col-12 text-center">
          <button type="submit" className="btn btn-success px-5">Register</button>
        </div>
      </form>
    </div>
  );
}

export default Register;
