import mysql from "mysql2/promise";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const mysqlPool = mysql.createPool({
  host: required("MYSQL_HOST"),
  port: Number(process.env.MYSQL_PORT ?? 3306),
  user: required("MYSQL_USER"),
  // Senha vazia é válida (ex.: root local no XAMPP).
  password: process.env.MYSQL_PASSWORD ?? "",
  database: required("MYSQL_DATABASE"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
