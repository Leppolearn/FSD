export default function Button({ children, variant = 'primary', onClick, type = 'button', fullWidth = false }) {
  return (
    <button type={type} onClick={onClick} className={`btn btn-${variant} ${fullWidth ? 'btn-full' : ''}`}>
      {children}
    </button>
  )
}
