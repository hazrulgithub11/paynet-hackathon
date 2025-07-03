export interface Account {
  id: string;
  accountName: string;
  balance: string;
  backgroundColor: string;
  type: string;
}

export const accounts: Account[] = [
  {
    id: '1',
    accountName: 'TnG',
    balance: 'RM 2,500.00',
    backgroundColor: 'rgba(0, 0, 0, 1)',
    type: 'Digital Wallet'
  },
  {
    id: '2',
    accountName: 'GrabPay',
    balance: 'RM 1,250.50',
    backgroundColor: 'rgba(0, 0, 0, 1)',
    type: 'Digital Wallet'
  },
  {
    id: '3',
    accountName: 'Boost',
    balance: 'RM 890.75',
    backgroundColor: 'rgba(0, 0, 0, 1)',
    type: 'Digital Wallet'
  },
  {
    id: '4',
    accountName: 'ShopeePay',
    balance: 'RM 3,420.25',
    backgroundColor: 'rgba(0, 0, 0, 1)',
    type: 'Digital Wallet'
  }
]; 