import { User } from '@/services/api';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import malaysiaData from '@/server/data/mydummy.json';
import thailandData from '@/server/data/thaidummy.json';

// Define account type
interface Account {
  accountId: string;
  accountName: string;
  accountNumber: string;
  balance: number;
  type: 'bank' | 'digital_wallet';
  provider: string;
  isActive: boolean;
  color: string;
}

interface UserContextType {
  selectedUser: User | null;
  userCountry: string;
  selectedAccount: Account | null;
  setSelectedUser: (user: User | null) => void;
  setUserCountry: (country: string) => void;
  setSelectedAccount: (account: Account) => void;
  getCurrentBankId: () => string | null;
  getUserCurrency: () => string;
  getUserAccounts: () => Account[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock users data based on backend data
const mockUsers: { [key: string]: User[] } = {
  Thailand: [
    {
      userId: "thai_001",
      name: "Ah Kong",
      balance: 29980,
      accountNumber: "TH001234567890",
      phone: "+66812345678",
      email: "ahkong@thaibank.com"
    },
    {
      userId: "thai_002",
      name: "Somchai",
      balance: 15601,
      accountNumber: "TH001234567891",
      phone: "+66812345679",
      email: "somchai@thaibank.com"
    }
  ],
  Malaysia: [
    {
      userId: "malay_001",
      name: "Ahmad Abdullah",
      balance: 10000,
      accountNumber: "MY001234567890",
      phone: "+60123456789",
      email: "ahmad@maybank.com"
    },
    {
      userId: "malay_002",
      name: "Siti Nurhaliza",
      balance: 15000,
      accountNumber: "MY001234567891",
      phone: "+60123456790",
      email: "siti@maybank.com"
    }
  ]
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userCountry, setUserCountry] = useState<string>('Malaysia'); // Default to Malaysia
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Get accounts based on current country
  const getUserAccounts = (): Account[] => {
    const currentData = userCountry === 'Thailand' ? thailandData : malaysiaData;
    return currentData.userAccounts as Account[];
  };

  // Custom setSelectedAccount with logging
  const handleSetSelectedAccount = (account: Account) => {
    console.log('UserContext: Setting selected account to:', account.accountName, account.accountId);
    console.log('UserContext: Previous selected account:', selectedAccount?.accountName, selectedAccount?.accountId);
    setSelectedAccount(account);
  };

  // Initialize with first user of selected country and first account
  useEffect(() => {
    if (!selectedUser && mockUsers[userCountry]) {
      setSelectedUser(mockUsers[userCountry][0]);
    }
    
    // Only initialize account if none is selected
    if (!selectedAccount) {
      const accounts = getUserAccounts();
      if (accounts.length > 0) {
        console.log('UserContext: Initializing with first account:', accounts[0].accountName);
        setSelectedAccount(accounts[0]);
      }
    }
  }, [userCountry, selectedUser]);

  // Log when selectedAccount changes
  useEffect(() => {
    if (selectedAccount) {
      console.log('UserContext: Selected account changed to:', selectedAccount.accountName, selectedAccount.accountId);
    }
  }, [selectedAccount]);

  // Helper function to determine country from account
  const getUserCountryFromAccount = (account: Account | null): string => {
    if (!account) return '';
    // Check if account ID contains 'th' for Thailand
    return account.accountId.includes('th') ? 'Thailand' : 'Malaysia';
  };

  const getCurrentBankId = (): string | null => {
    if (userCountry === 'Thailand') {
      return 'THAI_BANK_001';
    } else if (userCountry === 'Malaysia') {
      return 'MAYBANK_001';
    }
    return null;
  };

  const getUserCurrency = (): string => {
    return userCountry === 'Thailand' ? 'THB' : 'MYR';
  };

  const value: UserContextType = {
    selectedUser,
    userCountry,
    selectedAccount,
    setSelectedUser,
    setUserCountry,
    setSelectedAccount: handleSetSelectedAccount,
    getCurrentBankId,
    getUserCurrency,
    getUserAccounts,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Export mock users for use in other components
export { mockUsers };
// Export Account type for use in other components
export type { Account };
