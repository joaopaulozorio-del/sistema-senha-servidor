const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

// Sua conexão com o MongoDB
const mongoURI = "mongodb+srv://joaopaulozorio_db_user:5XBzTcqSHzuKf4UB@sistem-de-senhas.qxvgymx.mongodb.net/Test?retryWrites=true&w=majority&appName=sistem-de-senhas";

mongoose.connect(mongoURI)
  .then(() => console.log("Conectado ao MongoDB!"))
  .catch(err => console.error("Erro MongoDB:", err));

// Schema atualizado com HWID e Data de Expiração
const SenhaSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  usada: { type: Boolean, default: false },
  hwid: { type: String, default: null },         // Salva o ID do PC
  expiraEm: { type: Date, default: null }        // Salva quando a key vence
}, { collection: 'senhas' });

const Senha = mongoose.model("Senha", SenhaSchema);

app.post("/validar", async (req, res) => {
  const { senha, hwid } = req.body;

  try {
    const senhaDoc = await Senha.findOne({ codigo: senha.trim() });

    if (!senhaDoc) {
      return res.json({ ok: false, msg: "KEY INVÁLIDA!" });
    }

    const agora = new Date();

    // 1. VERIFICAÇÃO DE EXPIRAÇÃO
    if (senhaDoc.expiraEm && agora > senhaDoc.expiraEm) {
      return res.json({ ok: false, msg: "KEY EXPIRADA (24H VENCIDAS)!" });
    }

    // 2. PRIMEIRO USO (Vincular HWID e definir 24 horas)
    if (!senhaDoc.usada) {
      senhaDoc.usada = true;
      senhaDoc.hwid = hwid;
      // Define expiração para 24 horas a partir de agora
      senhaDoc.expiraEm = new Date(agora.getTime() + 24 * 60 * 60 * 1000); 
      await senhaDoc.save();

      return res.json({ 
        ok: true, 
        msg: `ACESSO LIBERADO! VÁLIDO ATÉ: ${senhaDoc.expiraEm.toLocaleTimeString()}` 
      });
    }

    // 3. VERIFICAÇÃO DE HWID (Se já foi usada, o PC tem que ser o mesmo)
    if (senhaDoc.hwid !== hwid) {
      return res.json({ ok: false, msg: "ESTA KEY PERTENCE A OUTRO PC!" });
    }

    // Se chegou aqui, a key é válida, o PC é o mesmo e está no prazo
    res.json({ ok: true, msg: "BEM-VINDO DE VOLTA!" });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ ok: false, msg: "ERRO NO SERVIDOR" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
