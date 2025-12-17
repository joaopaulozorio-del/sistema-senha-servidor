const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const app = express()

app.use(express.json())
app.use(cors())

// SEU LINK DO MONGODB (Recuperado do seu backup)
const mongoURI = "mongodb+srv://joaopaulozorio_db_user:5XBzTcqSHzuKf4UB@sistem-de-senhas.qxvgymx.mongodb.net/Test?retryWrites=true&w=majority&appName=sistem-de-senhas"

mongoose.connect(mongoURI)
  .then(() => console.log("Conectado ao MongoDB com sucesso!"))
  .catch(err => console.error("Erro ao conectar:", err))

// NOVO ESQUEMA: Agora salva HWID e Data de Expiração
const SenhaSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  usada: { type: Boolean, default: false },
  hwid: { type: String, default: null },
  expiraEm: { type: Date, default: null }
}, { collection: 'senhas' })

const Senha = mongoose.model("Senha", SenhaSchema)

app.post("/validar", async (req, res) => {
  const { senha, hwid } = req.body 
  
  try {
    const senhaEncontrada = await Senha.findOne({ codigo: senha.trim() })
    
    if (!senhaEncontrada) {
        return res.json({ ok: false, msg: "KEY INVÁLIDA" })
    }

    const agora = new Date()

    // 1. PRIMEIRO USO (Vincular HWID e 24h)
    if (!senhaEncontrada.usada) {
        senhaEncontrada.usada = true
        senhaEncontrada.hwid = hwid
        senhaEncontrada.expiraEm = new Date(agora.getTime() + 24 * 60 * 60 * 1000) 
        await senhaEncontrada.save()
        return res.json({ ok: true, msg: "ACESSO LIBERADO (PRIMEIRO USO)" })
    }

    // 2. JÁ USADA - Verificar se é o mesmo PC (HWID)
    if (senhaEncontrada.hwid !== hwid) {
        return res.json({ ok: false, msg: "KEY VINCULADA A OUTRO PC!" })
    }

    // 3. MESMO PC - Verificar se o tempo de 24h acabou
    if (agora > senhaEncontrada.expiraEm) {
        return res.json({ ok: false, msg: "KEY EXPIRADA (24H PASSARAM)" })
    }

    // TUDO OK
    return res.json({ ok: true, msg: "BEM-VINDO DE VOLTA!" })

  } catch (erro) {
    res.status(500).json({ ok: false, msg: "ERRO NO SERVIDOR" })
  }
})

// O Render usa a porta da variável de ambiente PORT
const PORT = process.env.PORT || 10000
app.listen(PORT, () => console.log(`Servidor Online na porta ${PORT}`))
