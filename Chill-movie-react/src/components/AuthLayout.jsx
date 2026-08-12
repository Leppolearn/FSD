export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <aside className="auth-side">
        <div className="auth-side-art">
          <div className="side-circle side-circle-a" />
          <div className="side-circle side-circle-b" />
          <div className="fake-poster poster-one"><span>ORBIT<br />7</span></div>
          <div className="fake-poster poster-two"><span>NEON<br />DISTRICT</span></div>
          <div className="fake-poster poster-three"><span>THE<br />LAST<br />SIGNAL</span></div>
        </div>
        <div className="auth-side-copy">
          <span>YOUR NEXT STORY</span>
          <h2>Temukan cerita<br /><em>yang cocok</em> untukmu.</h2>
          <p>Streaming discovery yang simpel. Pilih film, tekan play, lalu chill.</p>
        </div>
      </aside>
      <main className="auth-main">{children}</main>
    </div>
  )
}
