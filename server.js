const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const app = express()

app.use(express.json())
app.use(cors())

const mongoURI = "SUA_URL_DO_MONGODB_AQUI" // Mantenha a sua URL original

mongoose.connect(mongoURI)
  .then(() => console.log("Conectado ao MongoDB!"))

// NOVO ESQUEMA: Agora salva HWID e Data de Expiração
const SenhaSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  usada: { type: Boolean, default: false },
  hwid: { type: String, default: null },
  expiraEm: { type: Date, default: null }
}, { collection: 'senhas' })

const Senha = mongoose.model("Senha", SenhaSchema)

app.post("/validar", async (req, res) => {
  const { senha, hwid } = req.body // Recebe a senha e o HWID do PC
  
  try {
    const senhaEncontrada = await Senha.findOne({ codigo: senha.trim() })
    
    if (!senhaEncontrada) {
        return res.json({ ok: false, msg: "KEY INVÁLIDA" })
    }

    const agora = new Date()

    // CENÁRIO 1: PRIMEIRO USO (Vincular HWID e 24h)
    if (!senhaEncontrada.usada) {
        senhaEncontrada.usada = true
        senhaEncontrada.hwid = hwid
        senhaEncontrada.expiraEm = new Date(agora.getTime() + 24 * 60 * 60 * 1000) // +24 horas
        await senhaEncontrada.save()
        return res.json({ ok: true, msg: "ACESSO LIBERADO (PRIMEIRO USO)" })
    }

    // CENÁRIO 2: JÁ FOI USADA - Verificar se é o mesmo PC (HWID)
    if (senhaEncontrada.hwid !== hwid) {
        return res.json({ ok: false, msg: "KEY VINCULADA A OUTRO PC!" })
    }

    // CENÁRIO 3: MESMO PC - Verificar se o tempo de 24h acabou
    if (agora > senhaEncontrada.expiraEm) {
        return res.json({ ok: false, msg: "KEY EXPIRADA (24H PASSARAM)" })
    }

    // TUDO OK: Mesmo PC e ainda está no prazo de 24h
    return res.json({ ok: true, msg: "BEM-VINDO DE VOLTA!" })

  } catch (erro) {
    res.status(500).json({ ok: false, msg: "ERRO NO SERVIDOR" })
  }
})

app.listen(process.env.PORT || 3000, () => console.log("Servidor Online!"))
