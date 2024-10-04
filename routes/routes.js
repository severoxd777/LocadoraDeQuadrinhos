const express = require("express");
const pool = require("../banco/db");
const router = express.Router();

// Rota POST para criar um novo usuário
router.post("/", async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING *",
      [nome, email, senha]
    );
    res.status(201).json({
      message: "Usuário criado com sucesso",
      usuario: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao criar usuário", error);
    res.status(500).json({ message: "Erro ao criar usuário" });
  }
});

// Rota GET para listar todos os usuários
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM usuarios");
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar usuários", err);
    res.status(500).send("Erro ao buscar usuários");
  }
});

module.exports = router;
