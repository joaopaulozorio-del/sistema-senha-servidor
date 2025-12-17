const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const app = express()

app.use(express.json())
app.use(cors())

// URL CORRIGIDA: sistem-de-senhas (sem o 'a' de sistema, como pediste)
const mongoURI = "mongodb+srv://joaopaulozorio_db_user:5XBzTcqSHzuKf4UB@sistem-de-senhas.qxvgymx.mongodb.net/Test?retryWrites=true&w=majority&appName=sistem-de-senhas"

mongoose.connect(mongoURI)
  .then(() => console.log("Conectado ao MongoDB (Cluster: sistem-de-senhas) com sucesso!"))
  .catch(err => console.error("Erro ao conectar ao MongoDB:", err))

const SenhaSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  usada: { type: Boolean, default: false }
}, { collection: 'senhas' })

const Senha = mongoose.model("Senha", SenhaSchema)

app.post("/validar", async (req, res) => {
  const { senha } = req.body
  if (!senha) return res.json({ ok: false, msg: "Senha vazia" })

  try {
    const senhaEncontrada = await Senha.findOne({ codigo: senha.trim() })

    if (!senhaEncontrada) {
      return res.json({ ok: false, msg: "Senha inválida" })
    }

    if (senhaEncontrada.usada) {
      return res.json({ ok: false, msg: "Senha já utilizada" })
    }

    senhaEncontrada.usada = true
    await senhaEncontrada.save()

    res.json({ ok: true, msg: "Acesso liberado" })
  } catch (erro) {
    console.error("Erro interno:", erro)
    res.json({ ok: false, msg: "Erro no servidor" })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT)
})
