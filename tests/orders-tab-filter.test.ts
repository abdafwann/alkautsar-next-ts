import { describe, it, expect } from 'vitest';

export function filterOrdersByTab(
  orders: Array<{ id: string; orderStatus: string; paymentStatus: string }>,
  tab: string
) {
  return orders.filter(order => {
    switch (tab) {
      case 'UNPAID':
        return order.orderStatus === 'WAITING_FOR_PAYMENT' || order.paymentStatus === 'UNPAID';
      case 'PAID':
        return (order.paymentStatus === 'PAID' && order.orderStatus === 'PROCESSING') || order.orderStatus === 'PAID';
      case 'PROCESSING':
        return order.orderStatus === 'PREPARING';
      case 'SHIPPED':
        return order.orderStatus === 'IN_DELIVERY';
      case 'DELIVERED':
        return order.orderStatus === 'DELIVERED' || order.orderStatus === 'COMPLETED';
      default:
        return true;
    }
  });
}

describe('Customer Orders Tab Filtering Logic', () => {
  const sampleOrders = [
    { id: '1', orderStatus: 'WAITING_FOR_PAYMENT', paymentStatus: 'UNPAID' },
    { id: '2', orderStatus: 'PROCESSING', paymentStatus: 'PAID' }, // Paid, awaiting packaging
    { id: '3', orderStatus: 'PREPARING', paymentStatus: 'PAID' },  // Being packaged
    { id: '4', orderStatus: 'IN_DELIVERY', paymentStatus: 'PAID' }, // Shipped
    { id: '5', orderStatus: 'DELIVERED', paymentStatus: 'PAID' },   // Delivered
    { id: '6', orderStatus: 'COMPLETED', paymentStatus: 'PAID' },   // Completed
    { id: '7', orderStatus: 'CANCELLED', paymentStatus: 'UNPAID' }, // Cancelled
  ];

  it('should filter UNPAID orders accurately', () => {
    const res = filterOrdersByTab(sampleOrders, 'UNPAID');
    expect(res.map(o => o.id)).toContain('1');
    expect(res.map(o => o.id)).not.toContain('2');
  });

  it('should filter PAID orders when paymentStatus is PAID and orderStatus is PROCESSING', () => {
    const res = filterOrdersByTab(sampleOrders, 'PAID');
    expect(res.map(o => o.id)).toEqual(['2']);
  });

  it('should filter PROCESSING (Dikemas) orders when orderStatus is PREPARING', () => {
    const res = filterOrdersByTab(sampleOrders, 'PROCESSING');
    expect(res.map(o => o.id)).toEqual(['3']);
  });

  it('should filter SHIPPED and DELIVERED properly', () => {
    expect(filterOrdersByTab(sampleOrders, 'SHIPPED').map(o => o.id)).toEqual(['4']);
    expect(filterOrdersByTab(sampleOrders, 'DELIVERED').map(o => o.id)).toEqual(['5', '6']);
  });
});
