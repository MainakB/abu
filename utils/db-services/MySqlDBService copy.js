import { PoolOptions, Pool, createPool } from "mysql2/promise";

export class MySqlDBService {
  constructor(args) {
    const { host, user, password, port, database, isSsl } = args;
    this.host = host;
    this.user = user;
    this.password = password;
    this.port = port;
    this.database = database;
    this.ssl = isSsl;
    this.connectTimeout = 10000;
    this.connectLimit = 10;
    this.pool = createPool(this.getPoolOptions());
  }

  getPoolOptions() {
    const conf = {
      host: this.host,
      user: this.user,
      password: this.password,
      port: this.port,
      database: this.database,
      connectTimeout: this.connectTimeout,
      charset: "UTF8_GENERAL_CI",
      connectLimit: this.connectLimit,
      ...(this.ssl
        ? {
            ssl: {
              rejectUnauthorized: true,
            },
          }
        : {}),
    };
    return conf;
  }

  async runQuery(queryStr) {
    let result;
    const connection = await this.pool.getConnection();
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
