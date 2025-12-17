const express = require("express")
const fs = require("fs")
const app = express()

app.use(express.json())

// Lista de senhas ativas (agora em memória, não em arquivo)
// Quando o servidor inicia, todas as senhas estão como 'false' (não usadas).
const senhasAtivas = {
  "ABC123": false,
  "TESTE456": false,
  "SENHA789": false
}


// rota para validar senha
app.post("/validar", (req, res) => {
  const { senha } = req.body

  // 1. Verifica se a senha existe na lista
  if (!(senha in senhasAtivas)) {
    return res.json({ ok: false, msg: "Senha inválida" })
  }

  // 2. Verifica se a senha já foi usada (marcada como true)
  if (senhasAtivas[senha] === true) {
    return res.json({ ok: false, msg: "Senha já utilizada" })
  }

  // 3. Marca a senha como usada (dentro da memória)
  senhasAtivas[senha] = true

  // 4. Envia a resposta de sucesso
  res.json({ ok: true, msg: "Acesso liberado" })
})


const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT)
})