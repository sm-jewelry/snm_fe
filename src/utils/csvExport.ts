/**
 * CSV Export Utility
 * Provides functions to export data as CSV files
 */

import Swal from "sweetalert2";

/**
 * Convert an array of objects to CSV format
 */
function convertToCSV(data: any[], headers: string[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Create CSV header row
  const headerRow = headers.join(',');

  // Create CSV data rows
  const dataRows = data.map((item) => {
    return headers
      .map((header) => {
        const value = item[header];

        // Handle different value types
        if (value === null || value === undefined) {
          return '';
        }

        // Escape quotes and wrap in quotes if contains comma, newline, or quote
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
      })
      .join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Download a CSV file
 */
function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Export orders data to CSV
 */
export function exportOrdersToCSV(orders: any[], filename?: string): void {
  if (!orders || orders.length === 0) {
    Swal.fire({
      icon: "info",
      title: "No Orders",
      text: "No orders to export",
      timer: 2000,
      showConfirmButton: false,
    });
    return;
  }

  // Define the columns to export
  const headers = [
    'orderId',
    'customerName',
    'customerEmail',
    'status',
    'paymentStatus',
    'total',
    'itemCount',
    'createdAt',
  ];

  // Transform data for CSV export
  const csvData = orders.map((order) => ({
    orderId: order.orderId || '',
    customerName: order.customerName || 'N/A',
    customerEmail: order.customerEmail || 'N/A',
    status: order.status || 'pending',
    paymentStatus: order.paymentStatus || 'pending',
    total: order.total || 0,
    itemCount: order.itemCount || 0,
    createdAt: order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : '',
  }));

  const csv = convertToCSV(csvData, headers);
  const date = new Date().toISOString().split('T')[0];
  const finalFilename = filename || `orders-export-${date}.csv`;

  downloadCSV(csv, finalFilename);
}

/**
 * Export customers data to CSV
 */
export function exportCustomersToCSV(customers: any[], filename?: string): void {
  if (!customers || customers.length === 0) {
    Swal.fire({
      icon: "info",
      title: "No Customers",
      text: "No customers to export",
      timer: 2000,
      showConfirmButton: false,
    });
    return;
  }

  // Define the columns to export
  const headers = [
    '_id',
    'email',
    'firstName',
    'lastName',
    'phone',
    'isActive',
    'totalOrders',
    'lifetimeValue',
    'createdAt',
  ];

  // Transform data for CSV export
  const csvData = customers.map((customer) => ({
    _id: customer._id || '',
    email: customer.email || '',
    firstName: customer.firstName || '',
    lastName: customer.lastName || '',
    phone: customer.phone || '',
    isActive: customer.isActive ? 'Active' : 'Inactive',
    totalOrders: customer.totalOrders || 0,
    lifetimeValue: customer.lifetimeValue || 0,
    createdAt: customer.createdAt ? new Date(customer.createdAt).toLocaleString('en-IN') : '',
  }));

  const csv = convertToCSV(csvData, headers);
  const date = new Date().toISOString().split('T')[0];
  const finalFilename = filename || `customers-export-${date}.csv`;

  downloadCSV(csv, finalFilename);
}
