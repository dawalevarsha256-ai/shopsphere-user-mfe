import { useState } from 'react';

interface Props {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
}

export default function FormField({ id, label, type = 'text', value, onChange, error, placeholder, autoComplete }: Props) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="um-field">
      <label className="um-label" htmlFor={id}>{label}</label>
      <div className="um-input-wrap">
        <input
          id={id}
          className={`um-input${error ? ' um-input-error' : ''}${isPassword ? ' um-input-pw' : ''}`}
          type={isPassword && show ? 'text' : type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
        {isPassword && (
          <button type="button" className="um-toggle" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
            {show ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error && <p id={`${id}-error`} className="um-error" role="alert">{error}</p>}
    </div>
  );
}
