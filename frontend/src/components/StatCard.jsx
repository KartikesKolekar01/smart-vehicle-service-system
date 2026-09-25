export default function StatCard({ icon: Icon, label, value, color = 'brand' }) {
  const colors = {
    brand: 'from-brand-500 to-brand-700',
    green: 'from-emerald-500 to-green-700',
    purple: 'from-purple-500 to-indigo-700',
    orange: 'from-orange-500 to-red-600',
    blue: 'from-blue-500 to-cyan-700',
  };

  return (
    <div className="bg-white rounded-2xl p-5 card-shadow border border-slate-100 card-shadow-hover">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div
          className={`w-12 h-12 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center`}
        >
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  );
}