const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

class QueryChain {
  constructor(items, filter = {}) {
    this._items = items.filter((item) =>
      Object.entries(filter).every(([k, v]) => {
        if (Array.isArray(item[k])) return item[k].includes(v);
        return item[k] === v;
      })
    );
  }
  sort(sortSpec) {
    const [key, dir] = Object.entries(sortSpec)[0];
    this._items.sort((a, b) => {
      const va = a[key] instanceof Date ? a[key].getTime() : new Date(a[key] || 0).getTime();
      const vb = b[key] instanceof Date ? b[key].getTime() : new Date(b[key] || 0).getTime();
      return dir === -1 ? vb - va : va - vb;
    });
    return this;
  }
  limit(n) {
    this._items = this._items.slice(0, n);
    return this;
  }
  then(resolve, reject) {
    return Promise.resolve(this._items).then(resolve, reject);
  }
}

function createHybridModel(modelName, mongooseModel, defaults = {}) {
  const filePath = path.join(DB_DIR, `${modelName.toLowerCase()}s.json`);

  function readStore() {
    if (!fs.existsSync(filePath)) return [];
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      return [];
    }
  }

  function writeStore(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  function wrapDoc(raw) {
    if (!raw) return null;
    const doc = { ...raw };
    doc.save = async function () {
      const list = readStore();
      const idx = list.findIndex((i) => String(i._id) === String(doc._id));
      const { save, ...plain } = doc;
      if (idx !== -1) {
        list[idx] = plain;
      } else {
        list.push(plain);
      }
      writeStore(list);
      return doc;
    };
    return doc;
  }

  return {
    get isUsingMongo() {
      return global.USE_MONGODB === true;
    },

    async countDocuments(filter = {}) {
      if (this.isUsingMongo) return mongooseModel.countDocuments(filter);
      const list = readStore();
      return list.filter((item) =>
        Object.entries(filter).every(([k, v]) => {
          if (Array.isArray(item[k])) return item[k].includes(v);
          return item[k] === v;
        })
      ).length;
    },

    find(filter = {}) {
      if (this.isUsingMongo) return mongooseModel.find(filter);
      const list = readStore().map(wrapDoc);
      return new QueryChain(list, filter);
    },

    async findOne(filter = {}) {
      if (this.isUsingMongo) return mongooseModel.findOne(filter);
      const list = readStore();
      const found = list.find((item) =>
        Object.entries(filter).every(([k, v]) => item[k] === v)
      );
      return wrapDoc(found || null);
    },

    async findById(id) {
      if (this.isUsingMongo) return mongooseModel.findById(id);
      const list = readStore();
      const found = list.find((item) => String(item._id) === String(id));
      return wrapDoc(found || null);
    },

    async create(data) {
      if (this.isUsingMongo) return mongooseModel.create(data);
      const list = readStore();
      const newDoc = {
        _id: crypto.randomBytes(12).toString('hex'),
        ...defaults,
        ...data,
        createdAt: data.createdAt || new Date().toISOString()
      };
      list.push(newDoc);
      writeStore(list);
      return wrapDoc(newDoc);
    },

    async insertMany(docs) {
      if (this.isUsingMongo) return mongooseModel.insertMany(docs);
      const list = readStore();
      const inserted = docs.map((d) => ({
        _id: crypto.randomBytes(12).toString('hex'),
        ...defaults,
        ...d,
        createdAt: d.createdAt || new Date().toISOString()
      }));
      list.push(...inserted);
      writeStore(list);
      return inserted.map(wrapDoc);
    },

    async findByIdAndDelete(id) {
      if (this.isUsingMongo) return mongooseModel.findByIdAndDelete(id);
      const list = readStore();
      const idx = list.findIndex((item) => String(item._id) === String(id));
      if (idx === -1) return null;
      const [removed] = list.splice(idx, 1);
      writeStore(list);
      return removed;
    },

    async deleteMany(filter = {}) {
      if (this.isUsingMongo) return mongooseModel.deleteMany(filter);
      if (Object.keys(filter).length === 0) {
        writeStore([]);
        return;
      }
      const list = readStore().filter(
        (item) => !Object.entries(filter).every(([k, v]) => item[k] === v)
      );
      writeStore(list);
    }
  };
}

module.exports = { createHybridModel };
