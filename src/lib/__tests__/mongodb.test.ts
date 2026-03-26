import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MongoClient } from 'mongodb';

vi.mock('mongodb', () => {
  return {
    MongoClient: vi.fn(),
  };
});

describe('MongoDB Connection Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('throws error when MONGODB_URI is empty upon module import', async () => {
    delete process.env.MONGODB_URI;
    
    await expect(async () => {
      // Dynamic import to catch initialization error
      await import('../mongodb');
    }).rejects.toThrow('Please add your Mongo URI to .env.local');
  });

  it('initializes in development mode with globals', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017';
    vi.stubEnv('NODE_ENV', 'development');
    
    // Clear global promise state if it exists
    const globalWithMongo = global as any;
    delete globalWithMongo._mongoClientPromise;

    const mockConnect = vi.fn().mockResolvedValue({
      db: vi.fn().mockReturnValue('mockDevDb'),
    });

    vi.mocked(MongoClient).mockImplementation(function(this: any) {
      this.connect = mockConnect;
      return this;
    } as any);

    const { getDb } = await import('../mongodb');
    
    // Verify it connects and uses global variable for HMR caching
    expect(globalWithMongo._mongoClientPromise).toBeDefined();
    
    const db = await getDb('testdb');
    expect(db).toBe('mockDevDb');
    expect(mockConnect).toHaveBeenCalled();
  });

  it('initializes in production mode without globals', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017';
    vi.stubEnv('NODE_ENV', 'production');

    const mockConnect = vi.fn().mockResolvedValue({
      db: vi.fn().mockReturnValue('mockProdDb'),
    });

    vi.mocked(MongoClient).mockImplementation(function(this: any) {
      this.connect = mockConnect;
      return this;
    } as any);

    const { getDb } = await import('../mongodb');
    
    const db = await getDb('proddb');
    expect(db).toBe('mockProdDb');
    expect(mockConnect).toHaveBeenCalled();
  });

  it('getDb throws if connection fails', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017';
    vi.stubEnv('NODE_ENV', 'production');

    const mockConnect = vi.fn().mockRejectedValue(new Error('Connection failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(MongoClient).mockImplementation(function(this: any) {
      this.connect = mockConnect;
      return this;
    } as any);

    const { getDb } = await import('../mongodb');
    
    await expect(getDb('testdb')).rejects.toThrow('Connection failed');
    expect(consoleSpy).toHaveBeenCalledWith('Mongo connection failed', expect.any(Error));
    consoleSpy.mockRestore();
  });
});
