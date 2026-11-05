const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const DB_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

function matchesFilter(item, filter = {}) {
  if (!filter || Object.keys(filter).length === 0) return true;

  if (filter.$or && Array.isArray(filter.$or)) {
    const orMatches = filter.$or.some((sub) => matchesFilter(item, sub));
    if (!orMatches) return false;
  }

  for (const [k, v] of Object.entries(filter)) {
    if (k === '$or') continue;
    const itemVal = item[k];

    if (v instanceof RegExp) {
      if (!v.test(String(itemVal || ''))) return false;
    } else if (v && typeof v === 'object' && v.$ne !== undefined) {
      if (String(itemVal) === String(v.$ne)) return false;
    } else if (Array.isArray(itemVal)) {
      if (!itemVal.includes(v)) return false;
    } else if (String(itemVal) !== String(v)) {
      return false;
    }
  }
  return true;
}

class QueryChain {
  constructor(items) {
    this._items = [...items];
    this._populateKey = null;
  }
  populate(field) {
    this._populateKey = field;
    if (field === 'favoriteRestaurants') {
      const restPath = path.join(DB_DIR, 'restaurants.json');
      let rests = [];
      if (fs.existsSync(restPath)) {
        try {
          rests = JSON.parse(fs.readFileSync(restPath, 'utf8'));
        } catch (err) {
          throw new Error(`Không thể đọc dữ liệu ${restPath}: ${err.message}`);
        }
      }
      const restMap = {};
      rests.forEach((r) => { restMap[String(r._id)] = r; });
      this._items.forEach((item) => {
        if (Array.isArray(item.favoriteRestaurants)) {
          item.favoriteRestaurants = item.favoriteRestaurants
            .map((id) => restMap[String(id)])
            .filter(Boolean);
        }
      });
    }
    return this;
  }
  select(fields = '') {
    this._items.forEach((item) => item.select?.(fields));
    return this;
  }
  sort(sortSpec = {}) {
    const entries = Object.entries(sortSpec);
    if (!entries.length) return this;
    const [key, dir] = entries[0];
    this._items.sort((a, b) => {
      let va = a[key];
      let vb = b[key];
      if (key === 'createdAt' || va instanceof Date || vb instanceof Date) {
        va = new Date(va || 0).getTime();
        vb = new Date(vb || 0).getTime();
      }
      if (va < vb) return dir === -1 ? 1 : -1;
      if (va > vb) return dir === -1 ? -1 : 1;
      return 0;
    });
    return this;
  }
  limit(n) {
    this._items = this._items.slice(0, n);
    return this;
  }
  lean() {
    this._items = this._items.map((item) => (typeof item.lean === 'function' ? item.lean() : item));
    return this;
  }
  then(resolve, reject) {
    return Promise.resolve(this._items).then(resolve, reject);
  }
}

function createHybridModel(modelName, mongooseModel, options = {}) {
  const filePath = path.join(DB_DIR, `${modelName.toLowerCase()}s.json`);

  function readStore() {
    if (!fs.existsSync(filePath)) return [];
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      throw new Error(`Không thể đọc dữ liệu ${filePath}: ${err.message}`);
    }
  }

  function writeStore(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  function wrapDoc(raw) {
    if (!raw) return null;
    const doc = { ...raw };

    if (modelName === 'User') {
      doc.comparePassword = async function (plain) {
        if (!doc.password) return false;
        if (doc.password.startsWith('$2a$') || doc.password.startsWith('$2b$')) {
          return bcrypt.compare(plain, doc.password);
        }
        return plain === doc.password;
      };
    }

    doc.set = function (updates) {
      Object.assign(doc, updates);
      return doc;
    };

    doc.select = function (fields = '') {
      const selectedFields = String(fields).split(/\s+/).filter(Boolean);
      const excludedFields = selectedFields
        .filter((field) => field.startsWith('-'))
        .map((field) => field.slice(1));
      const includedFields = selectedFields.filter((field) => !field.startsWith('-'));

      if (excludedFields.length) {
        excludedFields.forEach((field) => delete doc[field]);
      } else if (includedFields.length) {
        const keep = new Set([...includedFields, '_id']);
        Object.keys(doc).forEach((field) => {
          if (!keep.has(field) && typeof doc[field] !== 'function') delete doc[field];
        });
      }
      return doc;
    };

    doc.lean = function () {
      return Object.fromEntries(
        Object.entries(doc).filter(([, value]) => typeof value !== 'function')
      );
    };

    doc.populate = function (field) {
      if (modelName === 'User' && field === 'favoriteRestaurants') {
        const restaurantPath = path.join(DB_DIR, 'restaurants.json');
        let restaurants = [];
        if (fs.existsSync(restaurantPath)) {
          try {
            restaurants = JSON.parse(fs.readFileSync(restaurantPath, 'utf8'));
          } catch (err) {
            throw new Error(`Không thể đọc dữ liệu ${restaurantPath}: ${err.message}`);
          }
        }
        const byId = new Map(restaurants.map((restaurant) => [String(restaurant._id), restaurant]));
        doc.favoriteRestaurants = (doc.favoriteRestaurants || [])
          .map((restaurant) =>
            restaurant && typeof restaurant === 'object'
              ? restaurant
              : byId.get(String(restaurant))
          )
          .filter(Boolean);
      }
      return doc;
    };

    doc.deleteOne = async function () {
      const list = readStore();
      const idx = list.findIndex((i) => String(i._id) === String(doc._id));
      if (idx !== -1) {
        list.splice(idx, 1);
        writeStore(list);
      }
      return doc;
    };

    doc.save = async function () {
      if (modelName === 'User' && doc.password && !doc.password.startsWith('$2a$') && !doc.password.startsWith('$2b$')) {
        doc.password = await bcrypt.hash(doc.password, 10);
      }
      if (modelName === 'Restaurant' && !doc.mapUrl) {
        doc.mapUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${doc.name}, ${doc.address}`);
      }

      const list = readStore();
      const idx = list.findIndex((i) => String(i._id) === String(doc._id));
      const { save, set, deleteOne, comparePassword, ...plain } = doc;
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...plain, updatedAt: new Date().toISOString() };
      } else {
        list.push({ ...plain, createdAt: plain.createdAt || new Date().toISOString() });
      }
      writeStore(list);
      return wrapDoc(plain);
    };

    return doc;
  }

  const ModelConstructor = function (data = {}) {
    return wrapDoc({
      _id: crypto.randomBytes(12).toString('hex'),
      createdAt: new Date().toISOString(),
      ...options.defaults,
      ...data
    });
  };

  ModelConstructor.isUsingMongo = function () {
    return global.USE_MONGODB === true;
  };

  ModelConstructor.countDocuments = async function (filter = {}) {
    if (ModelConstructor.isUsingMongo()) return mongooseModel.countDocuments(filter);
    const list = readStore();
    return list.filter((item) => matchesFilter(item, filter)).length;
  };

  ModelConstructor.find = function (filter = {}) {
    if (ModelConstructor.isUsingMongo()) return mongooseModel.find(filter);
    const list = readStore().filter((item) => matchesFilter(item, filter)).map(wrapDoc);
    return new QueryChain(list);
  };

  ModelConstructor.findOne = async function (filter = {}) {
    if (ModelConstructor.isUsingMongo()) return mongooseModel.findOne(filter);
    const list = readStore();
    const found = list.find((item) => matchesFilter(item, filter));
    return wrapDoc(found || null);
  };

  ModelConstructor.findById = function (id) {
    if (ModelConstructor.isUsingMongo()) return mongooseModel.findById(id);
    const list = readStore();
    const found = list.find((item) => String(item._id) === String(id));
    return wrapDoc(found || null);
  };

  ModelConstructor.exists = async function (filter = {}) {
    if (ModelConstructor.isUsingMongo()) return mongooseModel.exists(filter);
    const list = readStore();
    const found = list.find((item) => matchesFilter(item, filter));
    return found ? { _id: found._id } : null;
  };

  ModelConstructor.create = async function (data) {
    if (ModelConstructor.isUsingMongo()) return mongooseModel.create(data);
    const instance = ModelConstructor(data);
    await instance.save();
    return instance;
  };

  ModelConstructor.insertMany = async function (docs) {
    if (ModelConstructor.isUsingMongo()) return mongooseModel.insertMany(docs);
    const instances = [];
    for (const d of docs) {
      const inst = await ModelConstructor.create(d);
      instances.push(inst);
    }
    return instances;
  };

  ModelConstructor.findByIdAndDelete = async function (id) {
    if (ModelConstructor.isUsingMongo()) return mongooseModel.findByIdAndDelete(id);
    const list = readStore();
    const idx = list.findIndex((item) => String(item._id) === String(id));
    if (idx === -1) return null;
    const [removed] = list.splice(idx, 1);
    writeStore(list);
    return removed;
  };

  ModelConstructor.deleteMany = async function (filter = {}) {
    if (ModelConstructor.isUsingMongo()) return mongooseModel.deleteMany(filter);
    if (!filter || Object.keys(filter).length === 0) {
      writeStore([]);
      return { deletedCount: 0 };
    }
    const list = readStore().filter((item) => !matchesFilter(item, filter));
    writeStore(list);
    return { deletedCount: 1 };
  };

  ModelConstructor.updateOne = async function (filter, update) {
    if (ModelConstructor.isUsingMongo()) return mongooseModel.updateOne(filter, update);
    const list = readStore();
    const idx = list.findIndex((item) => matchesFilter(item, filter));
    if (idx === -1) return { matchedCount: 0, modifiedCount: 0 };

    const doc = list[idx];
    if (update.$addToSet) {
      for (const [k, v] of Object.entries(update.$addToSet)) {
        if (!Array.isArray(doc[k])) doc[k] = [];
        if (!doc[k].map(String).includes(String(v))) doc[k].push(v);
      }
    }
    if (update.$pull) {
      for (const [k, v] of Object.entries(update.$pull)) {
        if (Array.isArray(doc[k])) {
          doc[k] = doc[k].filter((i) => String(i) !== String(v));
        }
      }
    }
    writeStore(list);
    return { matchedCount: 1, modifiedCount: 1 };
  };

  ModelConstructor.updateMany = async function (filter, update) {
    if (ModelConstructor.isUsingMongo()) return mongooseModel.updateMany(filter, update);
    const list = readStore();
    list.forEach((doc) => {
      if (matchesFilter(doc, filter)) {
        if (update.$pull) {
          for (const [k, v] of Object.entries(update.$pull)) {
            if (Array.isArray(doc[k])) {
              doc[k] = doc[k].filter((i) => String(i) !== String(v));
            }
          }
        }
      }
    });
    writeStore(list);
    return { modifiedCount: 1 };
  };

  ModelConstructor.aggregate = async function (pipeline = []) {
    if (ModelConstructor.isUsingMongo()) return mongooseModel.aggregate(pipeline);
    let list = readStore();

    for (const stage of pipeline) {
      if (stage.$match) {
        list = list.filter((item) => matchesFilter(item, stage.$match));
      } else if (stage.$sample) {
        const size = stage.$sample.size || 1;
        const shuffled = [...list].sort(() => 0.5 - Math.random());
        list = shuffled.slice(0, size);
      } else if (stage.$group) {
        const groups = {};
        const groupKey = stage.$group._id.replace(/^\$/, '');
        list.forEach((item) => {
          const val = item[groupKey] || 'Khác';
          if (!groups[val]) groups[val] = { count: 0, totalRating: 0 };
          groups[val].count += 1;
          groups[val].totalRating += Number(item.rating || 0);
        });
        list = Object.entries(groups).map(([k, g]) => ({
          _id: k,
          count: g.count,
          avgRating: g.count ? g.totalRating / g.count : 0
        }));
      } else if (stage.$sort) {
        const [k, dir] = Object.entries(stage.$sort)[0];
        list.sort((a, b) => (dir === -1 ? b[k] - a[k] : a[k] - b[k]));
      } else if (stage.$project) {
        list = list.map((item) => {
          const proj = {};
          for (const [pk, pv] of Object.entries(stage.$project)) {
            if (pv === 1) proj[pk] = item[pk];
          }
          return proj;
        });
      }
    }
    return list;
  };

  return ModelConstructor;
}

module.exports = { createHybridModel };
