import { loadConfig } from "./config.js";
import { openDatabase } from "./database.js";
const db = openDatabase(loadConfig().dbPath);
console.log(db.prepare("SELECT * FROM migrations ORDER BY version").all());
db.close();
