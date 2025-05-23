import oracledb from "oracledb";

export class OracleDBService {
  constructor(args) {
    const { host, user, password, port, database, isSsl } = args;
    this.host = host;
    this.user = user;
    this.password = password;
    this.port = port;
    this.database = database;
    this.ssl = isSsl;
    this.poolTimeout = 10000;
    this.poolMax = 10;
    this.pool = new oracledb.createPool(this.getPoolOptions());
  }

  getPoolOptions() {
    const conf = {
      connectString: `${this.host}:${this.port}/${this.database}`,
      user: this.user,
      password: this.password,
      poolTimeout: this.poolTimeout,
      poolMax: this.poolMax,
      ...(this.ssl ? {} : {}),
    };
    return conf;
  }

  async runQuery(queryStr) {
    let result;
    const connection = await this.pool.getConnection();
    try {
      result = await connection.execute(queryStr);
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
