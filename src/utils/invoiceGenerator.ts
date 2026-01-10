/**
 * Invoice Generator Utility - PDF Version
 * Generates PDF invoices for orders using jsPDF
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OrderItem {
  productId?: string | { _id: string; title: string; URL?: string };
  title?: string;
  name?: string;
  price: number;
  quantity: number;
  url?: string;
}

interface Address {
  fullName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  pinCode?: string;
  country?: string;
  phone?: string;
}

interface OrderData {
  _id: string;
  orderId?: string;
  createdAt: string;
  userId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  } | string;
  customerName?: string;
  customerEmail?: string;
  items: OrderItem[];
  shippingAddress?: Address;
  billingAddress?: Address;
  amount?: number;
  total?: number;
  status: string;
  paymentId?: string;
  transactionId?: string;
  paymentStatus?: string;
  paymentMethod?: string;
}

/**
 * Generate PDF invoice
 */
export function generateInvoicePDF(order: OrderData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPos = 20;

  // Helper function to get customer details
  const getCustomerDetails = () => {
    let name = 'N/A';
    let email = 'N/A';
    let phone = 'N/A';

    // Check if userId is populated (object)
    if (order.userId && typeof order.userId === 'object') {
      const user = order.userId;
      name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      email = user.email || 'N/A';
      phone = user.phone || 'N/A';
    }
    
    // Fallback to order-level fields
    if (name === '' || name === 'N/A') {
      name = order.customerName || 'N/A';
    }
    if (email === 'N/A') {
      email = order.customerEmail || 'N/A';
    }
    if (phone === 'N/A' && order.shippingAddress?.phone) {
      phone = order.shippingAddress.phone;
    }
    return { name, email, phone };
  };

  const customer = getCustomerDetails();

  // Header - Company Name
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(25, 118, 210);
  doc.text('SNM Jewellery', 20, yPos);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Premium Jewellery Collection', 20, yPos + 6);
  doc.text('Email: info@snmjewellery.com', 20, yPos + 11);
  doc.text('Phone: +91 1234567890', 20, yPos + 16);

  // Invoice Title and Details (Right aligned)
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('TAX INVOICE', pageWidth - 20, yPos, { align: 'right' });
  
  const orderNumber = order.orderId || order._id.slice(-8).toUpperCase();
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(25, 118, 210);
  doc.text(`Invoice #${orderNumber}`, pageWidth - 20, yPos + 7, { align: 'right' });
  doc.setTextColor(100, 100, 100);
  doc.text(`Date: ${orderDate}`, pageWidth - 20, yPos + 12, { align: 'right' });
  doc.text(`Status: ${order.status.toUpperCase()}`, pageWidth - 20, yPos + 17, { align: 'right' });

  yPos += 30;

  // Horizontal line
  doc.setDrawColor(25, 118, 210);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  // Customer Details Section
  const colWidth = (pageWidth - 40) / 3;
  
  // Bill To
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text('BILL TO', 20, yPos);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(customer.name, 20, yPos + 5);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(customer.email, 20, yPos + 10);
  doc.text(`Phone: ${customer.phone}`, 20, yPos + 15);

  // Ship To
  const shippingAddress = order.shippingAddress;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text('SHIP TO', 20 + colWidth, yPos);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  if (shippingAddress) {
    const shipName = shippingAddress.fullName || customer.name;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(shipName !== 'N/A' ? shipName : customer.name, 20 + colWidth, yPos + 5);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    let shipYPos = yPos + 10;
    if (shippingAddress.addressLine1) {
      doc.text(shippingAddress.addressLine1, 20 + colWidth, shipYPos);
      shipYPos += 4;
    }
    
    if (shippingAddress.addressLine2) {
      doc.text(shippingAddress.addressLine2, 20 + colWidth, shipYPos);
      shipYPos += 4;
    }
    
    // Build city line with available data
    const cityParts = [];
    if (shippingAddress.city) cityParts.push(shippingAddress.city);
    if (shippingAddress.state) cityParts.push(shippingAddress.state);
    const zipCode = shippingAddress.zipCode || shippingAddress.pinCode;
    if (zipCode) cityParts.push(zipCode);
    
    if (cityParts.length > 0) {
      doc.text(cityParts.join(', '), 20 + colWidth, shipYPos);
      shipYPos += 4;
    }
    
    doc.text(shippingAddress.country || 'India', 20 + colWidth, shipYPos);
    shipYPos += 4;
    
    const shipPhone = shippingAddress.phone || customer.phone;
    if (shipPhone !== 'N/A') {
      doc.text(`Phone: ${shipPhone}`, 20 + colWidth, shipYPos);
    }
  } else {
    doc.text('Address not provided', 20 + colWidth, yPos + 5);
  }

  // Payment Info
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text('PAYMENT INFO', 20 + colWidth * 2, yPos);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  let payYPos = yPos + 5;
  doc.text(`Status: ${(order.paymentStatus || 'Pending').toUpperCase()}`, 20 + colWidth * 2, payYPos);
  
  if (order.paymentMethod) {
    payYPos += 4;
    doc.text(`Method: ${order.paymentMethod}`, 20 + colWidth * 2, payYPos);
  }
  
  if (order.paymentId) {
    payYPos += 4;
    doc.text('Payment ID:', 20 + colWidth * 2, payYPos);
    payYPos += 4;
    doc.setFontSize(8);
    const payId = order.paymentId.length > 20 ? order.paymentId.substring(0, 20) + '...' : order.paymentId;
    doc.text(payId, 20 + colWidth * 2, payYPos);
    doc.setFontSize(9);
  }
  
  if (order.transactionId) {
    payYPos += 4;
    doc.text('Transaction ID:', 20 + colWidth * 2, payYPos);
    payYPos += 4;
    doc.setFontSize(8);
    const txId = order.transactionId.length > 20 ? order.transactionId.substring(0, 20) + '...' : order.transactionId;
    doc.text(txId, 20 + colWidth * 2, payYPos);
  }

  yPos += 38;

  // Items Table
  const tableData = order.items.map((item, index) => {
    const productTitle = typeof item.productId === 'object' 
      ? item.productId.title 
      : (item.title || item.name || 'Product');
    
    // Format numbers without rupee symbol for better rendering
    const unitPrice = item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const totalPrice = (item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    return [
      (index + 1).toString(),
      productTitle,
      item.quantity.toString(),
      `Rs. ${unitPrice}`,
      `Rs. ${totalPrice}`
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['#', 'Item Description', 'Qty', 'Unit Price', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [51, 51, 51],
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'left',
    },
    styles: {
      fontSize: 9,
      cellPadding: 5,
      lineColor: [224, 224, 224],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 'auto', halign: 'left' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  });

  // Get final Y position after table
  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Totals Section
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = 0; // Add tax calculation if needed
  const shipping = 0; // Add shipping calculation if needed
  const total = order.amount || order.total || subtotal;

  const totalsX = pageWidth - 80;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Subtotal:', totalsX, yPos, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  const subtotalStr = `Rs. ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  doc.text(subtotalStr, pageWidth - 20, yPos, { align: 'right' });
  
  if (tax > 0) {
    yPos += 6;
    doc.setTextColor(100, 100, 100);
    doc.text('Tax (GST):', totalsX, yPos, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    const taxStr = `Rs. ${tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    doc.text(taxStr, pageWidth - 20, yPos, { align: 'right' });
  }
  
  if (shipping > 0) {
    yPos += 6;
    doc.setTextColor(100, 100, 100);
    doc.text('Shipping:', totalsX, yPos, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    const shippingStr = `Rs. ${shipping.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    doc.text(shippingStr, pageWidth - 20, yPos, { align: 'right' });
  }

  // Total line
  yPos += 8;
  doc.setDrawColor(51, 51, 51);
  doc.setLineWidth(0.5);
  doc.line(totalsX - 5, yPos - 2, pageWidth - 20, yPos - 2);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Total:', totalsX, yPos + 4, { align: 'right' });
  const totalStr = `Rs. ${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  doc.text(totalStr, pageWidth - 20, yPos + 4, { align: 'right' });

  // Footer
  const footerY = pageHeight - 30;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
  doc.setFontSize(8);
  doc.text('This is a computer-generated invoice and does not require a signature.', pageWidth / 2, footerY + 5, { align: 'center' });

  return doc;
}

/**
 * Download invoice as PDF file
 */
export function downloadInvoice(order: OrderData): void {
  const doc = generateInvoicePDF(order);
  const orderNumber = order.orderId || order._id.slice(-8).toUpperCase();
  doc.save(`Invoice-${orderNumber}.pdf`);
}

/**
 * Print invoice (opens PDF in new window for printing)
 */
export function printInvoice(order: OrderData): void {
  const doc = generateInvoicePDF(order);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  const printWindow = window.open(pdfUrl, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}