
export class MockCollection {
  name: string;
  data: any[];

  constructor(name: string) {
    this.name = name;
    this.data = [];
  }

  find(query: any = {}) {
    let filtered = this.data;
    if (Object.keys(query).length > 0) {
      filtered = this.data.filter(d => 
        Object.entries(query).every(([k, v]) => d[k] === v)
      );
    }
    
    return {
      sort: () => ({
        toArray: async () => filtered
      }),
      toArray: async () => filtered
    };
  }

  async findOne(query: any = {}) {
    return this.data.find(d => 
      Object.entries(query).every(([k, v]) => d[k] === v)
    ) || null;
  }

  async insertOne(doc: any) {
    const newDoc = { ...doc, _id: Math.random().toString(36).substring(2, 10) };
    this.data.push(newDoc);
    return { insertedId: newDoc._id, acknowledged: true };
  }

  async deleteOne(query: any) {
    const index = this.data.findIndex(d => 
      Object.entries(query).every(([k, v]) => {
        // Handle basic ObjectId matching if passed as object, or string
        if (k === '_id' && typeof v === 'object' && v !== null) return d[k] === v.toString(); 
        return d[k] === v;
      })
    );
    if (index > -1) {
      this.data.splice(index, 1);
      return { deletedCount: 1, acknowledged: true };
    }
    return { deletedCount: 0, acknowledged: true };
  }

  async updateOne(query: any, update: any) {
    const item = await this.findOne(query);
    if (item && update.$set) {
      Object.assign(item, update.$set);
      return { modifiedCount: 1, acknowledged: true };
    }
    return { modifiedCount: 0, acknowledged: true };
  }
}

class MockDb {
  collections: Record<string, MockCollection> = {};

  collection(name: string) {
    if (!this.collections[name]) {
      this.collections[name] = new MockCollection(name);
    }
    return this.collections[name];
  }
}

// Global instance to persist across reloads in dev if possible, 
// though essentially per-process.
const globalMockDb = new MockDb();

export async function getMockDb() {
  console.log("Using MOCK DB");
  return globalMockDb;
}
