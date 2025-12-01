import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WorkOrder, OSStatus } from '../types';
import { MOCK_ORDERS } from '../services/mockData';

interface WorkOrderContextType {
  orders: WorkOrder[];
  externalScheduleUrl: string;
  addOrder: (order: WorkOrder) => void;
  updateOrderStatus: (id: string, status: OSStatus) => void;
  completeOrder: (id: string, evidenceImage: string, aiLog: string) => void;
  editOrder: (updatedOrder: WorkOrder) => void;
  deleteOrder: (id: string) => void;
  updateScheduleUrl: (url: string) => void;
}

const WorkOrderContext = createContext<WorkOrderContextType | undefined>(undefined);

export const WorkOrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize Orders from LocalStorage or empty array (clean start)
  const [orders, setOrders] = useState<WorkOrder[]>(() => {
    const saved = localStorage.getItem('omni_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Initialize Schedule URL from LocalStorage
  const [externalScheduleUrl, setExternalScheduleUrl] = useState<string>(() => {
    return localStorage.getItem('omni_schedule_url') || '';
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('omni_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('omni_schedule_url', externalScheduleUrl);
  }, [externalScheduleUrl]);

  const addOrder = (order: WorkOrder) => {
    setOrders((prev) => [order, ...prev]);
  };

  const updateOrderStatus = (id: string, status: OSStatus) => {
    setOrders((prev) => 
      prev.map((order) => 
        order.id === id 
          ? { ...order, status } 
          : order
      )
    );
  };

  const completeOrder = (id: string, evidenceImage: string, aiLog: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? {
              ...order,
              status: OSStatus.COMPLETED,
              completedAt: new Date().toISOString(),
              evidenceImages: [evidenceImage], // Save the image
              aiAnalysisLog: aiLog // Save the AI report
            }
          : order
      )
    );
  };

  const editOrder = (updatedOrder: WorkOrder) => {
    setOrders((prev) => 
      prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
    );
  };

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  };

  const updateScheduleUrl = (url: string) => {
    setExternalScheduleUrl(url);
  };

  return (
    <WorkOrderContext.Provider value={{ 
      orders, 
      externalScheduleUrl,
      addOrder, 
      updateOrderStatus, 
      completeOrder, 
      editOrder, 
      deleteOrder, 
      updateScheduleUrl
    }}>
      {children}
    </WorkOrderContext.Provider>
  );
};

export const useWorkOrders = () => {
  const context = useContext(WorkOrderContext);
  if (!context) {
    throw new Error('useWorkOrders must be used within a WorkOrderProvider');
  }
  return context;
};
