/**
 * Date filtering utilities for analytics
 */

export type TimePeriod = 'today' | 'week' | 'month' | 'year' | 'all';

export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Get date range for a given time period
 */
export function getDateRangeForPeriod(period: TimePeriod): DateRange {
  const now = new Date();
  const end = new Date(now);
  let start = new Date(now);

  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'week':
      // Start of current week (Sunday)
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      break;

    case 'month':
      // Start of current month
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      break;

    case 'year':
      // Start of current year
      start = new Date(now.getFullYear(), 0, 1);
      start.setHours(0, 0, 0, 0);
      break;

    case 'all':
      // Set start to a very old date
      start = new Date(2020, 0, 1);
      break;
  }

  return { start, end };
}

/**
 * Get previous period date range for comparison
 */
export function getPreviousPeriodRange(period: TimePeriod): DateRange {
  const currentRange = getDateRangeForPeriod(period);
  const duration = currentRange.end.getTime() - currentRange.start.getTime();

  const end = new Date(currentRange.start.getTime() - 1);
  const start = new Date(end.getTime() - duration);

  return { start, end };
}

/**
 * Filter orders by date range
 */
export function filterOrdersByDateRange(orders: any[], range: DateRange): any[] {
  return orders.filter((order) => {
    const orderDate = new Date(order.createdAt || order.orderDate);
    return orderDate >= range.start && orderDate <= range.end;
  });
}

/**
 * Get period label for display
 */
export function getPeriodLabel(period: TimePeriod): string {
  switch (period) {
    case 'today':
      return 'Today';
    case 'week':
      return 'This Week';
    case 'month':
      return 'This Month';
    case 'year':
      return 'This Year';
    case 'all':
      return 'All Time';
  }
}

/**
 * Get previous period label for comparison
 */
export function getPreviousPeriodLabel(period: TimePeriod): string {
  switch (period) {
    case 'today':
      return 'Yesterday';
    case 'week':
      return 'Last Week';
    case 'month':
      return 'Last Month';
    case 'year':
      return 'Last Year';
    case 'all':
      return 'Previous Period';
  }
}
