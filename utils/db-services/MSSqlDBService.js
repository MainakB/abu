import { ConnectionPool } from "mssql";

export class MSSqlDBService {
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
    this.pool = new ConnectionPool(this.getPoolOptions());
  }

  getPoolOptions() {
    const conf = {
      server: this.host,
      user: this.user,
      password: this.password,
      port: this.port,
      database: this.database,
      pool: {
        max: this.connectTimeout,
        min: 0,
        idleTimeoutMillis: this.connectTimeout,
      },
      ...(this.ssl
        ? {
            options: {
              connectTimeout: this.connectTimeout,
              encrypt: true,
              trustServerCertificate: true,
            },
          }
        : {}),
      debug: true,
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
        await connection.close();
      }
    }
  }
}
