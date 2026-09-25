export default function Input({ label, error, icon: Icon, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}
        <input
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-xl border-2 ${
            error
              ? 'border-red-300 focus:border-red-500'
              : 'border-slate-200 focus:border-brand-500'
          } outline-none transition-colors bg-white text-slate-900 placeholder-slate-400`}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}