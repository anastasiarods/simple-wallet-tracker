let db: Map<any, any>;

declare global {
  var __db: Map<any, any>;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === "production") {
  db = new Map();
} else {
  if (!global.__db) {
    global.__db = new Map();
  }
  db = global.__db;
}

export { db };
