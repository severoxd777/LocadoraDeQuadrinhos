require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Verificar a conexão ao banco
pool.connect((err) => {
  if (err) {
    console.error("Erro ao conectar no PostgreSQL", err);
  } else {
    console.log("Conectado ao PostgreSQL");
  }
});

module.exports = pool;
