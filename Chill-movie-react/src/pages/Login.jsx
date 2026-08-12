import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import AuthCard from '../components/AuthCard'
import Input from '../components/Input'
import Button from '../components/Button'
import SocialLogin from '../components/SocialLogin'
import { getUser, loginUser } from '../utils/auth'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const submit = e => {
    e.preventDefault()
    const user = getUser()
    const demo = form.email === 'demo@chill.id' && form.password === 'password123'
    if (!form.email || !form.password) return setError('Email dan password wajib diisi.')
    if (!demo && (!user || user.email !== form.email || user.password !== form.password)) {
      return setError('Email atau password tidak sesuai.')
    }
    loginUser()
    navigate('/home')
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome to Chill"
        subtitle="Masuk dan lanjutkan film yang belum selesai kamu tonton."
        footer={<p>Belum punya akun? <Link to="/register">Daftar sekarang</Link></p>}
      >
        <form className="auth-form" onSubmit={submit}>
          <Input label="Email" name="email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="nama@email.com" required />
          <Input label="Password" name="password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Masukkan password" required />
          <div className="form-row"><label><input type="checkbox" /> Ingat saya</label><button type="button" className="forgot">Lupa password?</button></div>
          {error && <div className="auth-error">{error}</div>}
          <Button type="submit" fullWidth>Masuk</Button>
        </form>
        <SocialLogin />
      </AuthCard>
    </AuthLayout>
  )
}
