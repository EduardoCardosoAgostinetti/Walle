const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/user_route"); // verifique se o caminho está correto

const app = express();

app.use(cors());
app.use(express.json());

// ⚠️ Monta as rotas
app.use("/user", userRoutes);
console.log("Rotas /users carregadas");


module.exports = app;
