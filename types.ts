export enum UserRole {
  ADMIN = 'ADMIN',
  WORKER = 'WORKER',
  AUDITOR = 'AUDITOR'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  password?: string;
  department?: string;
}

export enum OSStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  VERIFIED = 'VERIFIED',
  BLOCKED = 'BLOCKED'
}

export enum OSPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  location: Location;
  priority: OSPriority;
  status: OSStatus;
  assignedToId: string;
  dueDate: string; // ISO String
  completedAt?: string; // ISO String
  referenceImages: string[];
  evidenceImages: string[]; // Stores the base64 or URL of completion photo
  aiAnalysisLog?: string; // Stores the AI feedback text generated during completion
  slaHours: number;
  value: number; // Monetary value or points
  technicalNotes: string;
  requiredNorms: string[]; // ISO codes or standard names
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
}