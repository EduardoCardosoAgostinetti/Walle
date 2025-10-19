const app = require("./app");
require("dotenv").config({ path: "../.env", quiet: true });

const port = process.env.API_PORT;

app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
