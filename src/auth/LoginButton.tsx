interface LoginButtonProps {
  onLogin?: () => void | Promise<void>;
  busy?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function LoginButton({ onLogin, busy = false, disabled = false, className = '' }: LoginButtonProps) {
  return (
    <button
      type="button"
      className={`btn public-login-button ${className}`.trim()}
      onClick={onLogin}
      disabled={busy || disabled}
    >
      {busy ? 'Conectando…' : 'Login'}
    </button>
  );
}
