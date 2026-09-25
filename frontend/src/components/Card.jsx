export default function Card({ children, className = '' }) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl card-shadow border border-slate-200 dark:border-slate-800 ${className}`}
    >
      {children}
    </div>
  );
}