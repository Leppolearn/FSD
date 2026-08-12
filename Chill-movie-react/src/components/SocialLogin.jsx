import { Chrome } from 'lucide-react'

export default function SocialLogin() {
  return (
    <>
      <div className="or"><span>atau lanjut dengan</span></div>
      <button
        type="button"
        className="google-btn"
        onClick={() => alert('Demo SSO — sambungkan Google OAuth pada backend production.')}
      >
        <Chrome size={18} /> Lanjut dengan Google
      </button>
    </>
  )
}
