export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  ...props
}) {
  const variants = {
    primary: 'bg-gradient-brand text-white hover:shadow-glow active:scale-[0.98]',
    danger: 'bg-danger text-white hover:bg-rose-700 hover:shadow-glow-accent active:scale-[0.98]',
    safe: 'bg-safe text-white hover:bg-emerald-700 active:scale-[0.98]',
    outline: 'border border-surface-200 bg-white text-surface-700 hover:bg-surface-50 hover:border-surface-300',
    ghost: 'text-surface-500 hover:bg-surface-100 hover:text-surface-800',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-sm',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
