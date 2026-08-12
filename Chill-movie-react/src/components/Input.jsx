import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export default function Input({ label, name, type = 'text', value, onChange, placeholder, error, required }) {
  const [show, setShow] = useState(false)
  const password = type === 'password'
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <div className="input-box">
        <input
          id={name}
          name={name}
          type={password && show ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
        {password && (
          <button type="button" className="input-action" onClick={() => setShow(!show)}>
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
      {error && <small className="error">{error}</small>}
    </div>
  )
}
