const express = require("express")
const fs = require("fs")
const app = express()

app.use(express.json())

// Arquivo onde ficam as senhas no servidor
const arquivo = "senhas-server.json"

// cria o arquivo se não existir
if (!fs.existsSync(arquivo)) {
  fs.writeFileSync(arquivo, JSON.stringify({
    "ABC123": false,
    "TESTE456": false,
    "SENHA789": false
  }, null, 2))
}

// rota para validar senha
app.post("/validar", (req, res) => {
  const { senha } = req.body
  const dados = JSON.parse(fs.readFileSync(arquivo))

  if (!(senha in dados)) {
    return res.json({ ok: false, msg: "Senha inválida" })
  }

  if (dados[senha] === true) {
    return res.json({ ok: false, msg: "Senha já utilizada" })
  }

  dados[senha] = true
  fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2))

  res.json({ ok: true, msg: "Acesso liberado" })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT)
})
