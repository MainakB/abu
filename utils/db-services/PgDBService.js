import { Pool } from "pg";

export class PgDBService {
  constructor(args) {
    const { host, user, password, port, database, isSsl } = args;
    this.host = host;
    this.user = user;
    this.password = password;
    this.port = port;
    this.database = database;
    this.ssl = isSsl;
    this.idleTimeoutMillis = 10000;
    this.max = 10;
    this.client_encoding = "UTF8_GENERAL_CI";
    this.pool = new Pool(this.getPoolOptions());
  }

  getPoolOptions() {
    const conf = {
      host: this.host,
      user: this.user,
      password: this.password,
      port: this.port,
      database: this.database,
      idleTimeoutMillis: this.idleTimeoutMillis,
      client_encoding: this.client_encoding,
      max: this.max,
      ...(this.ssl
        ? {
            ssl: true,
          }
        : {}),
    };
    return conf;
  }

  async runQuery(queryStr) {
    let result;
    const connection = await this.pool.connect();
    try {
      result = await connection.query(queryStr);
      return result;
    } catch (err) {
      console.error(`Error thrown running query: ` + err.message);
    } finally {
      if (connection) {
        await connection.release();
      }
    }
  }
}
