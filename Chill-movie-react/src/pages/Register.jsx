import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import AuthCard from '../components/AuthCard'
import Input from '../components/Input'
import Button from '../components/Button'
import SocialLogin from '../components/SocialLogin'
import { registerUser } from '../utils/auth'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [errors, setErrors] = useState({})

  const update = e => setForm({...form, [e.target.name]: e.target.value})

  const submit = e => {
    e.preventDefault()
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Nama minimal 2 karakter.'
    if (!/^\\S+@\\S+\\.\\S+$/.test(form.email)) next.email = 'Email tidak valid.'
    if (!/^[0-9+\\-\\s]{8,}$/.test(form.phone)) next.phone = 'Nomor HP tidak valid.'
    if (form.password.length < 8) next.password = 'Password minimal 8 karakter.'
    setErrors(next)
    if (!Object.keys(next).length) {
      registerUser(form)
      navigate('/home')
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Join Chill"
        subtitle="Buat akun dan temukan tontonan favoritmu."
        footer={<p>Sudah punya akun? <Link to="/login">Masuk di sini</Link></p>}
      >
        <form className="auth-form" onSubmit={submit}>
          <Input label="Nama lengkap" name="name" value={form.name} onChange={update} placeholder="Nama kamu" error={errors.name} required />
          <Input label="Email" name="email" type="email" value={form.email} onChange={update} placeholder="nama@email.com" error={errors.email} required />
          <Input label="Nomor HP" name="phone" type="tel" value={form.phone} onChange={update} placeholder="+62 812 3456 7890" error={errors.phone} required />
          <Input label="Password" name="password" type="password" value={form.password} onChange={update} placeholder="Minimal 8 karakter" error={errors.password} required />
          <label className="terms"><input type="checkbox" required /> Saya menyetujui syarat & ketentuan Chill.</label>
          <Button type="submit" fullWidth>Buat akun</Button>
        </form>
        <SocialLogin />
      </AuthCard>
    </AuthLayout>
  )
}
