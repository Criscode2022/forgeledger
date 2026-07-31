export function money(amount: number, currency = 'USD') {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export function statusLabel(status: string) {
  return status.replace(/_/g, ' ');
}

export function statusClass(status: string): string {
  switch (status) {
    case 'paid':
    case 'active':
    case 'completed':
      return 'text-success bg-elevated';
    case 'sent':
    case 'planned':
      return 'text-accent bg-elevated';
    case 'overdue':
    case 'cancelled':
    case 'void':
      return 'text-danger bg-elevated';
    case 'draft':
    case 'on_hold':
    case 'archived':
      return 'text-muted bg-elevated';
    default:
      return 'text-muted bg-elevated';
  }
}
