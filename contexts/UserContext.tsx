import { User } from '@/services/api';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface UserContextType {
  selectedUser: User | null;
  userCountry: string;
  setSelectedUser: (user: User | null) => void;
  setUserCountry: (country: string) => void;
  getCurrentBankId: () => string | null;
  getUserCurrency: () => string;
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

  // Initialize with first user of selected country
  useEffect(() => {
    if (!selectedUser && mockUsers[userCountry]) {
      setSelectedUser(mockUsers[userCountry][0]);
    }
  }, [userCountry, selectedUser]);

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
    setSelectedUser,
    setUserCountry,
    getCurrentBankId,
    getUserCurrency,
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
