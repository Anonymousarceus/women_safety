export default function Card({ title, icon, value, subtitle, color = 'primary', className = '' }) {
  const iconBg = {
    primary: 'bg-primary-100 text-primary-700',
    danger: 'bg-rose-100 text-rose-600',
    safe: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
  };

  const accent = {
    primary: 'from-primary-500',
    danger: 'from-rose-500',
    safe: 'from-emerald-500',
    warning: 'from-amber-500',
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-surface-200/60 bg-white p-5 shadow-glass card-hover ${className}`}>
      <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${accent[color]} to-transparent`} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-surface-400">{title}</p>
          <p className="mt-1.5 text-2xl font-extrabold text-surface-900">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-surface-400">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg[color]}`}>
            <span className="text-lg">{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
}
