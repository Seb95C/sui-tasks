/**
 * Indexer API Client
 * Fetches data from the off-chain indexer (PostgreSQL/GraphQL API)
 * This is faster than querying the blockchain directly
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const INDEXER_API_URL = process.env.NEXT_PUBLIC_INDEXER_API_URL || 'http://localhost:3001/api';

/**
 * Create configured axios instance for indexer API
 */
export function createIndexerClient(): AxiosInstance {
  const client = axios.create({
    baseURL: INDEXER_API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
  });

  // Request interceptor - add auth token if available
  client.interceptors.request.use(
    (config) => {
      // You can add authentication headers here if needed
      // const token = localStorage.getItem('authToken');
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`;
      // }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - handle errors globally
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error.response?.data || error.message);
      return Promise.reject(error);
    }
  );

  return client;
}

// Singleton instance
let indexerClientInstance: AxiosInstance | null = null;

/**
 * Get shared indexer client instance
 */
export function getIndexerClient(): AxiosInstance {
  if (!indexerClientInstance) {
    indexerClientInstance = createIndexerClient();
  }
  return indexerClientInstance;
}

/**
 * Generic GET request to indexer
 */
export async function fetchFromIndexer<T>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const client = getIndexerClient();
  const response = await client.get<T>(endpoint, config);
  return response.data;
}

/**
 * Generic POST request to indexer
 */
export async function postToIndexer<T>(
  endpoint: string,
  data: any,
  config?: AxiosRequestConfig
): Promise<T> {
  const client = getIndexerClient();
  const response = await client.post<T>(endpoint, data, config);
  return response.data;
}
