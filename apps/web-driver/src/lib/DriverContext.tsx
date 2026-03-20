import React, { createContext, useContext, useState } from 'react';
import { mockDeliveries } from './mock-data';

const DriverContext = createContext<any>(null);

export function DriverProvider({ children }: any) {
  const [deliveries, setDeliveries] = useState<any[]>(mockDeliveries);

  const updateDeliveryStatus = (id: string, status: string) => {
    setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
  };

  const acceptDelivery = (id: string) => {
    setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'assigned' } : d)));
  };

  return (
    <DriverContext.Provider
      value={{
        deliveries,
        updateDeliveryStatus,
        acceptDelivery,
      }}
    >
      {children}
    </DriverContext.Provider>
  );
}

export const useDriverContext = () => useContext(DriverContext);
