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
    backgroundColor: 'bg-blue-500',
    type: 'Digital Wallet'
  },
  {
    id: '2',
    accountName: 'GrabPay',
    balance: 'RM 1,250.50',
    backgroundColor: 'bg-blue-500',
    type: 'Digital Wallet'
  },
  {
    id: '3',
    accountName: 'Boost',
    balance: 'RM 890.75',
    backgroundColor: 'bg-blue-500',
    type: 'Digital Wallet'
  },
  {
    id: '4',
    accountName: 'ShopeePay',
    balance: 'RM 3,420.25',
    backgroundColor: 'bg-orange-500',
    type: 'Digital Wallet'
  }
]; 