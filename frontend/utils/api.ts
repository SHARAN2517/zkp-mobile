import axios from 'axios';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Device {
  device_id: string;
  device_name: string;
  device_type: string;
  public_key_hash: string;
  registered_at: number;
  last_authenticated: number;
  is_active: boolean;
  total_data_submitted: number;
}

export interface Metrics {
  devices: {
    total: number;
    active: number;
    inactive: number;
  };
  data: {
    total_submitted: number;
    anchored: number;
    pending: number;
  };
  merkle_batches: number;
  authentications: number;
  blockchain: {
    total_gas_used: number;
    average_gas_per_batch: number;
    account_balance: number;
  };
}

export const registerDevice = async (deviceData: {
  device_id: string;
  device_name: string;
  device_type: string;
  secret: string;
}) => {
  const response = await api.post('/devices/register', deviceData);
  return response.data;
};

export const authenticateDevice = async (authData: {
  device_id: string;
  secret: string;
}) => {
  const response = await api.post('/devices/authenticate', authData);
  return response.data;
};

export const submitDeviceData = async (data: {
  device_id: string;
  data: any;
  timestamp?: number;
}) => {
  const response = await api.post('/devices/data', data);
  return response.data;
};

export const getAllDevices = async (): Promise<{ devices: Device[]; total: number }> => {
  const response = await api.get('/devices');
  return response.data;
};

export const getDevice = async (deviceId: string): Promise<Device> => {
  const response = await api.get(`/devices/${deviceId}`);
  return response.data;
};

export const getPendingData = async () => {
  const response = await api.get('/devices/data/pending');
  return response.data;
};

export const anchorMerkleRoot = async (metadata?: string) => {
  const response = await api.post('/merkle/anchor', { batch_metadata: metadata });
  return response.data;
};

export const verifyDataIntegrity = async (verificationData: {
  data_hash: string;
  batch_id: number;
}) => {
  const response = await api.post('/merkle/verify', verificationData);
  return response.data;
};

export const getMerkleBatches = async () => {
  const response = await api.get('/merkle/batches');
  return response.data;
};

export const getSystemMetrics = async (): Promise<Metrics> => {
  const response = await api.get('/metrics');
  return response.data;
};

export default api;
