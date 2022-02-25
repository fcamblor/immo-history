import {Injectable} from "@nestjs/common";
import {Pool} from "pg";

@Injectable()
export class DbService {
    private readonly pool: Pool;
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.DEV_MODE ? false : { rejectUnauthorized: false }, // Only enable TLS/SSL connections for Heroku.
        });

        // The pool with emit an error on behalf of any idle clients it contains if a backend error or network partition happens.
        this.pool.on("error", (err) => {
            console.error('Unexpected error on idle client "DATABASE" class: ', err);
            process.exit(-1);
        });
    }

    async query(query: string, ...values: any[]) {
        const client = await this.pool.connect();
        try {
            return await client.query(query, values);
        } finally {
            client.release();
        }
    }
}
