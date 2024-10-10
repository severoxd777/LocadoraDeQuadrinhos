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

// Rota POST para autenticar o usuário
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const result = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1 AND senha = $2",
      [email, senha]
    );

    if (result.rows.length > 0) {
      // Se o usuário foi encontrado, retorna o ID dele
      res.status(200).json({
        message: "Login bem-sucedido",
        usuarioId: result.rows[0].id,
      });
    } else {
      // Se o usuário não foi encontrado, retorna erro
      res.status(401).json({ message: "Email ou senha incorretos" });
    }
  } catch (error) {
    console.error("Erro ao autenticar usuário", error);
    res.status(500).json({ message: "Erro ao autenticar usuário" });
  }
});

// Rota POST para adicionar um mangá à lista do usuário
router.post("/:id/mangas", async (req, res) => {
  const userId = req.params.id;
  const { mangaId } = req.body;

  try {
    await pool.query(
      "INSERT INTO user_mangas (user_id, manga_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [userId, mangaId]
    );
    res.status(200).json({ message: "Mangá adicionado com sucesso!" });
  } catch (error) {
    console.error("Erro ao adicionar mangá ao usuário", error);
    res.status(500).json({ message: "Erro ao adicionar mangá ao usuário" });
  }
});

// Rota GET para obter os mangás salvos pelo usuário
router.get("/:id/mangas", async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await pool.query(
      "SELECT manga_id FROM user_mangas WHERE user_id = $1",
      [userId]
    );

    const mangaIds = result.rows.map(row => row.manga_id);

    res.status(200).json({ mangaIds });
  } catch (error) {
    console.error("Erro ao obter mangás do usuário", error);
    res.status(500).json({ message: "Erro ao obter mangás do usuário" });
  }
});

// Rota GET para buscar as informações do usuário logado
router.get("/perfil/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      "SELECT id, nome, email, foto_perfil, preferencias_leitura FROM usuarios WHERE id = $1",
      [id]
    );

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: "Usuário não encontrado" });
    }
  } catch (error) {
    console.error("Erro ao buscar informações do usuário", error);
    res.status(500).json({ message: "Erro ao buscar informações do usuário" });
  }
});

// Rota GET para buscar todos os usuários (apenas para administradores)
router.get("/admin/usuarios", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, nome, email, foto_perfil, preferencias_leitura FROM usuarios");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar todos os usuários", error);
    res.status(500).json({ message: "Erro ao buscar todos os usuários" });
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
