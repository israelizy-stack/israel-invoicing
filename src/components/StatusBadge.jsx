export default function StatusBadge({ status }) {
  const map = {
    draft: 'status-draft',
    sent: 'status-sent',
    paid: 'status-paid',
    overdue: 'status-overdue',
  }
  return (
    <span className={map[status] || 'status-draft'}>
      {status?.toUpperCase()}
    </span>
  )
}
