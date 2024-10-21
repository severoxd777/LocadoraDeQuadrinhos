const express = require("express");
const path = require("path");
const { createTables } = require("./banco/createTables");
const usuarioRoutes = require("./routes/routes"); // Importar as rotas de usuários
const app = express();

// Middleware para interpretar JSON
app.use(express.json());

// Criar as tabelas ao iniciar o servidor
createTables();

// Servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, "public")));

// Usar as rotas de usuários
app.use("/usuarios", usuarioRoutes);

// Configurar as rotas de páginas estáticas
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "paginas", "login", "login.html")
  );
});

app.get("/registrar", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "paginas", "registrar", "registrar.html")
  );
});

app.get("/perfil", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "paginas", "perfil", "perfil.html")
  );
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
