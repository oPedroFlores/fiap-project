const app = require("./app");

const config = require("./serverConfig.json");
const port = config.port;

app
  .listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  })
  .on("error", (err) => {
    console.error("Erro ao iniciar o servidor: ", err);
  });
