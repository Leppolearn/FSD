import Logo from './Logo'

export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="auth-card">
      <Logo />
      <div className="auth-title">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {children}
      <div className="auth-footer">{footer}</div>
    </div>
  )
}
