const pool = require("./db");

const createTables = async () => {
  try {
    const queryText = `
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        foto_perfil TEXT,
        preferencias_leitura TEXT,
        is_admin BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS perfis_acesso (
        id SERIAL PRIMARY KEY,
        descricao VARCHAR(50) NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS recuperacao_senha (
        id SERIAL PRIMARY KEY,
        usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL,
        expiracao TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS gerenciamento_conteudo (
        id SERIAL PRIMARY KEY,
        usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
        acao VARCHAR(255) NOT NULL,
        descricao TEXT,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Nova tabela para relacionar usuários e mangás
      CREATE TABLE IF NOT EXISTS user_mangas (
        user_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
        manga_id INT NOT NULL,
        PRIMARY KEY (user_id, manga_id)
      );

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns WHERE table_name='usuarios' AND column_name='perfil_id'
        ) THEN
          ALTER TABLE usuarios ADD COLUMN perfil_id INT REFERENCES perfis_acesso(id);
        END IF;
      END $$;

      INSERT INTO perfis_acesso (descricao) VALUES ('Usuário'), ('Administrador')
      ON CONFLICT (descricao) DO NOTHING;
    `;

    await pool.query(queryText);
    console.log("Tabelas criadas com sucesso!");
  } catch (err) {
    console.error("Erro ao criar tabelas", err);
  }
};

module.exports = { createTables };
