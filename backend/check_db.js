
import "dotenv/config"
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);
async function check() {
    try {
        const res = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';`;
        console.log("Current columns in users table:");
        res.forEach(row => console.log(`- ${row.column_name}: ${row.data_type}`));
    } catch (e) {
        console.error(e);
    }
}
check();
