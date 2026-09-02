export default function DashboardCard({ label, value, icon: Icon, accent = 'brand', suffix }) {
  const ACCENTS = {
    brand: 'bg-brand-50 text-brand-600',
    mint: 'bg-mint-50 text-mint-600',
    amber: 'bg-amber-50 text-amber-500',
    rose: 'bg-rose-50 text-rose-500',
    ink: 'bg-cloud-100 text-ink-700',
  };

  return (
    <div className="bg-white rounded-card border border-cloud-200 p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <p className="text-sm text-ink-500 font-medium">{label}</p>
        {Icon && (
          <span className={`h-9 w-9 rounded-lg flex items-center justify-center ${ACCENTS[accent]}`}>
            <Icon size={17} />
          </span>
        )}
      </div>
      <p className="mt-3 font-display font-bold text-2xl tabular text-ink-900">
        {value}
        {suffix && <span className="text-sm font-body font-medium text-ink-500 ml-1">{suffix}</span>}
      </p>
    </div>
  );
}
