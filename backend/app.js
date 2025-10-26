const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/user_route");
const transactionRoutes = require("./routes/transaction_route");

const app = express();

app.use(cors());
app.use(express.json());

// ⚠️ Monta as rotas
app.use("/user", userRoutes);
app.use("/transaction", transactionRoutes);

module.exports = app;
