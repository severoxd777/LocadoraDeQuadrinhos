require('dotenv').config();
const express = require("express");
const pool = require("../banco/db");
const nodemailer = require('nodemailer'); // Importar Nodemailer
const router = express.Router();

// Configuração do transporter do Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: 587, // Porta para TLS
  secure: false, // true para 465, false para outras portas
  auth: {
    user: process.env.EMAIL_USER, // 'severonuvem@gmail.com'
    pass: process.env.EMAIL_PASS, // Senha do app ou senha do Gmail
  },
  logger: true,
  debug: true,
});

// Função para gerar uma senha aleatória
function generateRandomPassword(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Rota POST para adicionar múltiplos mangás ao usuário
router.post("/:userId/mangas/bulk", async (req, res) => {
  const { userId } = req.params;
  const { mangaIds } = req.body;

  if (!Array.isArray(mangaIds) || mangaIds.length === 0) {
    return res.status(400).json({ message: "Nenhum mangá foi fornecido." });
  }

  try {
    // Verifica se o usuário existe
    const userResult = await pool.query("SELECT * FROM usuarios WHERE id = $1", [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Preparar inserção dos mangás
    const values = [];
    mangaIds.forEach((mangaId, index) => {
      values.push(`($1, $${index + 2})`);
    });

    const query = `
      INSERT INTO user_mangas (user_id, manga_id)
      VALUES ${values.join(',')}
      ON CONFLICT DO NOTHING
    `;

    await pool.query(query, [userId, ...mangaIds]);

    res.status(200).json({ message: "Mangás adicionados com sucesso!" });
  } catch (error) {
    console.error('Erro ao adicionar mangás:', error);
    res.status(500).json({ message: 'Erro ao adicionar mangás' });
  }
});

// Rota POST para criar um novo usuário
router.post("/", async (req, res) => {
  const { nome, email, senha, isAdminPassword } = req.body;
  let is_admin = false;

  // Senha padrão para definir um usuário como administrador
  const adminPassword = process.env.ADMIN_PASSWORD; // Usando variável de ambiente

  // Verifica se a senha de administrador está correta
  if (isAdminPassword && isAdminPassword === adminPassword) {
    is_admin = true;
  }

  try {
    const result = await pool.query(
      "INSERT INTO usuarios (nome, email, senha, is_admin) VALUES ($1, $2, $3, $4) RETURNING *",
      [nome, email, senha, is_admin]
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
      "SELECT id, is_admin, password_reset FROM usuarios WHERE email = $1 AND senha = $2",
      [email, senha]
    );

    if (result.rows.length > 0) {
      res.status(200).json({
        message: "Login bem-sucedido",
        usuarioId: result.rows[0].id,
        isAdmin: result.rows[0].is_admin, // Retorna se o usuário é administrador
        passwordReset: result.rows[0].password_reset, // Indica se a senha foi resetada
      });
    } else {
      res.status(401).json({ message: "Email ou senha incorretos" });
    }
  } catch (error) {
    console.error("Erro ao autenticar usuário", error);
    res.status(500).json({ message: "Erro ao autenticar usuário" });
  }
});

// Rota POST para solicitar recuperação de senha
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email é obrigatório" });
  }

  try {
    // Verifica se o usuário existe
    const userResult = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Email não encontrado" });
    }

    const user = userResult.rows[0];

    // Gera uma nova senha aleatória
    const tempPassword = generateRandomPassword(8);

    // Atualiza a senha no banco de dados e define password_reset como true
    await pool.query("UPDATE usuarios SET senha = $1, password_reset = $2 WHERE id = $3", [tempPassword, true, user.id]);

    // Configura o email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperação de Senha - Biblioteca de Mangás',
      text: `Olá ${user.nome},

Sua senha foi redefinida. Sua nova senha temporária é: ${tempPassword}

Por favor, faça login e altere sua senha imediatamente.

Atenciosamente,
Equipe da Biblioteca de Mangás`,
    };

    // Envia o email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Erro ao enviar email de recuperação:", error);
        return res.status(500).json({ message: "Erro ao enviar email de recuperação" });
      } else {
        console.log("Email de recuperação enviado:", info.response);
        return res.status(200).json({ message: "Email de recuperação enviado com sucesso" });
      }
    });

  } catch (error) {
    console.error("Erro ao processar recuperação de senha:", error);
    res.status(500).json({ message: "Erro ao processar recuperação de senha" });
  }
});

// Rota PUT para definir nova senha após recuperação
router.put("/:id/set-password", async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: "Nova senha é obrigatória" });
  }

  try {
    // Verifica se o usuário existe
    const userResult = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Atualiza a senha e define password_reset como false
    await pool.query(
      "UPDATE usuarios SET senha = $1, password_reset = $2 WHERE id = $3",
      [newPassword, false, id]
    );

    res.status(200).json({ message: "Senha atualizada com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar senha do usuário:", error);
    res.status(500).json({ message: "Erro ao atualizar senha do usuário" });
  }
});

// Middleware para verificar se o usuário é administrador
function verificarAdmin(req, res, next) {
  const isAdmin = req.headers['isadmin'];

  if (isAdmin === 'true') {
    next();
  } else {
    res.status(403).json({ message: "Acesso negado. Apenas administradores podem acessar esta rota." });
  }
}

// Rota DELETE para deletar um usuário (apenas para administradores)
router.delete("/admin/usuarios/:id", verificarAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Verifica se o usuário existe
    const userResult = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Deleta o usuário
    await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);

    res.status(200).json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar usuário", error);
    res.status(500).json({ message: "Erro ao deletar usuário" });
  }
});

// Rota DELETE para remover um mangá do perfil do usuário
router.delete("/:userId/mangas/:mangaId", async (req, res) => {
  let { userId, mangaId } = req.params;

  console.log(`Recebida solicitação para deletar o mangá ${mangaId} do usuário ${userId}`);

  // Converter IDs para inteiros
  userId = parseInt(userId, 10);
  mangaId = parseInt(mangaId, 10);

  if (isNaN(userId) || isNaN(mangaId)) {
    console.error("IDs inválidos fornecidos.");
    return res.status(400).json({ message: "IDs inválidos" });
  }

  try {
    // Verifica se o usuário existe
    const userResult = await pool.query("SELECT * FROM usuarios WHERE id = $1", [userId]);

    if (userResult.rows.length === 0) {
      console.error("Usuário não encontrado.");
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Verifica se o mangá está associado ao usuário
    const userMangaResult = await pool.query(
      "SELECT * FROM user_mangas WHERE user_id = $1 AND manga_id = $2",
      [userId, mangaId]
    );

    if (userMangaResult.rows.length === 0) {
      console.error("Mangá não encontrado no perfil do usuário.");
      return res.status(404).json({ message: "Mangá não encontrado no perfil do usuário" });
    }

    // Remove o mangá do perfil do usuário
    await pool.query(
      "DELETE FROM user_mangas WHERE user_id = $1 AND manga_id = $2",
      [userId, mangaId]
    );

    console.log("Mangá removido com sucesso.");
    res.status(200).json({ message: "Mangá removido com sucesso do perfil do usuário" });
  } catch (error) {
    console.error("Erro ao remover mangá do usuário", error);
    res.status(500).json({ message: "Erro ao remover mangá do usuário" });
  }
});

// Rota GET para obter informações do usuário
router.get("/perfil/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Verifica se o usuário existe
    const userResult = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const user = userResult.rows[0];

    res.status(200).json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      foto_perfil: user.foto_perfil,
      preferencias_leitura: user.preferencias_leitura,
    });
  } catch (error) {
    console.error("Erro ao obter informações do usuário:", error);
    res.status(500).json({ message: "Erro ao obter informações do usuário" });
  }
});

// Rota GET para obter os mangás do usuário
router.get("/:userId/mangas", async (req, res) => {
  const { userId } = req.params;

  try {
    // Verifica se o usuário existe
    const userResult = await pool.query("SELECT * FROM usuarios WHERE id = $1", [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Obtém os IDs dos mangás associados ao usuário
    const mangasResult = await pool.query(
      "SELECT manga_id FROM user_mangas WHERE user_id = $1",
      [userId]
    );

    const mangaIds = mangasResult.rows.map(row => row.manga_id);

    res.status(200).json({ mangaIds });
  } catch (error) {
    console.error("Erro ao obter mangás do usuário:", error);
    res.status(500).json({ message: "Erro ao obter mangás do usuário" });
  }
});


// Rota GET para buscar todos os usuários (apenas para administradores)
router.get("/admin/usuarios", verificarAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, nome, email, foto_perfil, preferencias_leitura FROM usuarios");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar todos os usuários", error);
    res.status(500).json({ message: "Erro ao buscar todos os usuários" });
  }
});

// Rota PUT para atualizar as preferências de leitura do usuário
router.put("/perfil/:id", async (req, res) => {
  const { id } = req.params;
  const { preferencias_leitura } = req.body;

  try {
    // Verifica se o usuário existe
    const userResult = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Atualiza as preferências do usuário
    await pool.query(
      "UPDATE usuarios SET preferencias_leitura = $1 WHERE id = $2",
      [preferencias_leitura, id]
    );

    res.status(200).json({ message: "Preferências atualizadas com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar preferências do usuário", error);
    res.status(500).json({ message: "Erro ao atualizar preferências do usuário" });
  }
});

// Rota PUT para atualizar as informações do usuário
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, email, currentPassword, newPassword } = req.body;

  try {
    // Verifica se o usuário existe
    const userResult = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const user = userResult.rows[0];

    // Atualização dos campos de nome e email
    let updateFields = [];
    let updateValues = [];
    let paramIndex = 1;

    if (nome && nome !== user.nome) {
      updateFields.push(`nome = $${paramIndex++}`);
      updateValues.push(nome);
    }

    if (email && email !== user.email) {
      updateFields.push(`email = $${paramIndex++}`);
      updateValues.push(email);
    }

    // Atualização da senha
    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Para alterar a senha, forneça a senha atual e a nova senha" });
      }

      if (currentPassword !== user.senha) {
        return res.status(400).json({ message: "Senha atual incorreta" });
      }

      updateFields.push(`senha = $${paramIndex++}`);
      updateValues.push(newPassword);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "Nenhuma alteração foi fornecida" });
    }

    updateValues.push(id); // Adiciona o ID para a cláusula WHERE

    const updateQuery = `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;

    await pool.query(updateQuery, updateValues);

    res.status(200).json({ message: "Perfil atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar perfil do usuário", error);
    res.status(500).json({ message: "Erro ao atualizar perfil do usuário" });
  }
});

module.exports = router;
