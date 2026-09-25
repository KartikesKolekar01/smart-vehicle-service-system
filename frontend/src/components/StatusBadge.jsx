export default function StatusBadge({ status }) {
  const colors = {
    REQUESTED: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    CONFIRMED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    ASSIGNED: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    IN_PROGRESS: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300',
    WAITING_FOR_PARTS: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
    COMPLETED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    CANCELLED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    PROCESSING: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    SUCCESS: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    FAILED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    REFUNDED: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    AVAILABLE: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    BUSY: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    ON_LEAVE: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
        colors[status] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
      }`}
    >
      {status?.replace(/_/g, ' ')}
    </span>
  );
}