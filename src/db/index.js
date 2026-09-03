/**
 * Base de données locale via NeDB
 * Stockage dans des fichiers JSON locaux — aucun serveur externe requis.
 * API compatible Mongoose : findOne, find, findOneAndUpdate, create, new Model().save()
 */

const Datastore = require('nedb-promises');
const path = require('path');
const fs = require('fs');

// Sur Railway, monter un volume sur /data et définir DATA_DIR=/data.
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function createStore(name) {
  return Datastore.create({
    filename: path.join(DATA_DIR, `${name}.db`),
    autoload: true,
  });
}

const stores = {
  guilds:    createStore('guilds'),
  users:     createStore('users'),
  warnings:  createStore('warnings'),
  tickets:   createStore('tickets'),
  giveaways: createStore('giveaways'),
  shopitems: createStore('shopitems'),
};

/**
 * Crée un modèle qui mime l'API Mongoose.
 * Supporte : new Model(data), findOne, find, findOneAndUpdate, create, deleteOne, deleteMany, updateMany
 */
function createModel(storeName, defaults = {}) {
  const db = stores[storeName];

  // Constructeur appelé avec "new Model({...})"
  function Model(data) {
    Object.assign(this, { ...defaults, ...data });
  }

  Model.prototype.save = async function () {
    if (this._id) {
      const { _id, ...rest } = this;
      await db.update({ _id }, { $set: rest });
    } else {
      const inserted = await db.insert({ ...this });
      Object.assign(this, inserted);
    }
    return this;
  };

  Model.prototype.toObject = function () {
    return { ...this };
  };

  // ─── Méthodes statiques ───────────────────────

  Model.create = async function (data) {
    const doc = await db.insert({ ...defaults, ...data });
    return Object.assign(new Model(), doc);
  };

  Model.findOne = async function (query) {
    const doc = await db.findOne(query);
    if (!doc) return null;
    return Object.assign(new Model(), doc);
  };

  Model.find = async function (query = {}) {
    const docs = await db.find(query);
    return docs.map(d => Object.assign(new Model(), d));
  };

  Model.findById = async function (id) {
    const doc = await db.findOne({ _id: id });
    if (!doc) return null;
    return Object.assign(new Model(), doc);
  };

  /**
   * findOneAndUpdate — upsert supporté, opérateurs $set/$inc/$push/$pull supportés.
   * IMPORTANT : si update={}, on retourne le doc existant sans modification (compatible Mongoose).
   */
  Model.findOneAndUpdate = async function (query, update, options = {}) {
    const existing = await db.findOne(query);

    if (!existing) {
      if (!options.upsert) return null;
      // Construire le nouveau document
      const base = { ...defaults, ...query };
      if (update.$set)  Object.assign(base, update.$set);
      if (update.$inc) {
        for (const [k, v] of Object.entries(update.$inc)) {
          setNested(base, k, (getNested(base, k) || 0) + v);
        }
      }
      if (update.$push) {
        for (const [k, v] of Object.entries(update.$push)) {
          const arr = getNested(base, k) || [];
          arr.push(v);
          setNested(base, k, arr);
        }
      }
      const inserted = await db.insert(base);
      return Object.assign(new Model(), inserted);
    }

    // Document existant — n'appliquer que les opérateurs Mongoose (jamais de remplacement brut)
    const hasOperators = update.$set || update.$inc || update.$push || update.$pull || update.$unset || update.$addToSet;
    if (hasOperators) {
      await db.update({ _id: existing._id }, update);
      const updated = await db.findOne({ _id: existing._id });
      return Object.assign(new Model(), updated);
    }

    // Pas d'opérateurs (update vide {}) → retourner le doc tel quel
    return Object.assign(new Model(), existing);
  };

  Model.findByIdAndUpdate = async function (id, update, options = {}) {
    return Model.findOneAndUpdate({ _id: id }, update, options);
  };

  Model.updateOne = async function (query, update) {
    return db.update(query, update, {});
  };

  Model.updateMany = async function (query, update) {
    return db.update(query, update, { multi: true });
  };

  Model.deleteOne = async function (query) {
    return db.remove(query, {});
  };

  Model.deleteMany = async function (query) {
    return db.remove(query, { multi: true });
  };

  Model.countDocuments = async function (query = {}) {
    return db.count(query);
  };

  Model._db = db;
  return Model;
}

// ─── Helpers pour accès imbriqué (ex: "economy.balance") ─

function getNested(obj, path) {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
}

function setNested(obj, path, value) {
  const keys = path.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!cur[keys[i]]) cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
}

// ─── Schémas par défaut ──────────────────────────

const guildDefault = {
  guildId: '', prefix: '+',
  welcome:  { enabled: false, channelId: null, message: null, embed: false },
  goodbye:  { enabled: false, channelId: null, message: null },
  autorole: { enabled: false, roleId: null },
  muteRole: null,
  logs: {
    enabled: false,
    categoryId: null,
    modLogs: null,
    raidLogs: null,
    msgLogs: null,
    roleLogs: null,
    voiceLogs: null,
    boostLogs: null,
  },
  tickets:  { enabled: false, categoryId: null, logChannelId: null, supportRoleId: null },
  suggestions: { enabled: false, channelId: null },
  levels:   { enabled: false, channelId: null, rewards: [] },
  birthdays: { enabled: false, channelId: null },
  verification: { enabled: false, channelId: null, roleId: null, message: null },
  automod: {
    antiSpam: false, antiLink: false, antiInsult: false,
    antiMention: false, antiRaid: false, antiAlt: false,
    whitelist: [], spamThreshold: 5, mentionThreshold: 5, minAge: 7,
  },
  counters: { members: null, bots: null, boosts: null, tickets: null, messages: null, messageCount: 0 },
  confession: { enabled: false, channelId: null },
  invites: { enabled: false },
};

const userDefault = {
  userId: '', guildId: '',
  economy: { balance: 0, bank: 0, lastDaily: null, lastWork: null, lastCrime: null },
  xp: 0, level: 0, lastXp: null,
  warnings: 0,
  afk: { active: false, reason: null, since: null },
  birthday: { date: null, announced: false },
  invites: { regular: 0, left: 0, fake: 0, bonus: 0 },
};

// ─── Export des modèles ──────────────────────────

module.exports = {
  Guild:    createModel('guilds',    guildDefault),
  User:     createModel('users',     userDefault),
  Warning:  createModel('warnings',  { userId: '', guildId: '', moderatorId: '', reason: '', date: null }),
  Ticket:   createModel('tickets',   { guildId: '', userId: '', channelId: '', status: 'open', number: 1, createdAt: null }),
  Giveaway: createModel('giveaways', { guildId: '', channelId: '', messageId: '', prize: '', winners: 1, endsAt: null, ended: false, entries: [], hostedBy: '' }),
  ShopItem: createModel('shopitems', { guildId: '', name: '', price: 0, role: null, description: '' }),
};
