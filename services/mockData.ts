import { User, UserRole, WorkOrder, OSStatus, OSPriority } from '../types';

export const CURRENT_USER: User = {
  id: 'usr_001',
  name: 'Carlos Mendes',
  email: 'carlos.mendes@omnicorp.com',
  role: UserRole.WORKER,
  avatarUrl: 'https://picsum.photos/100/100'
};

export const ADMIN_USER: User = {
  id: 'adm_001',
  name: 'Sarah Connor',
  email: 'sarah.connor@omnicorp.com',
  role: UserRole.ADMIN,
  avatarUrl: 'https://picsum.photos/101/101'
};

export const MOCK_ORDERS: WorkOrder[] = [];
