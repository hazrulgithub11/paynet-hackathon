export interface Account {
  id: string;
  accountName: string;
  balance: string;
}

export const accounts: Account[] = [
  {
    id: '1',
    accountName: 'TnG',
    balance: 'RM 2,500.00'
  },
  {
    id: '2',
    accountName: 'GrabPay',
    balance: 'RM 1,250.50'
  },
  {
    id: '3',
    accountName: 'Boost',
    balance: 'RM 890.75'
  },
  {
    id: '4',
    accountName: 'ShopeePay',
    balance: 'RM 3,420.25'
  }
]; 