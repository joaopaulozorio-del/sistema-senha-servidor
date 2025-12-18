const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());

const mongoURI = "mongodb+srv://joaopaulozorio_db_user:5XBzTcqSHzuKf4UB@sistem-de-senhas.qxvgymx.mongodb.net/Test?retryWrites=true&w=majority&appName=sistem-de-senhas";

mongoose.connect(mongoURI).then(() => console.log("MongoDB Online!"));

// Modelo com 'tipo' para definir a duração
const Senha = mongoose.model("Senha", new mongoose.Schema({
  codigo: String,
  usada: { type: Boolean, default: false },
  hwid: String,
  expiraEm: Date,
  tipo: { type: String, enum: ['7dias', '30dias', 'vitalicio'], default: '30dias' } 
}, { collection: 'senhas' }));

app.post("/validar", async (req, res) => {
  const { senha, hwid } = req.body;
  try {
    const doc = await Senha.findOne({ codigo: senha.trim() });
    if (!doc) return res.json({ ok: false, msg: "KEY INVÁLIDA!" });

    const agora = new Date();

    // 1. Verifica se já expirou (vitalício pula essa parte)
    if (doc.tipo !== 'vitalicio' && doc.expiraEm && agora > doc.expiraEm) {
      return res.json({ ok: false, msg: "SUA KEY EXPIROU!" });
    }

    // 2. Primeiro uso: Define o tempo baseado no tipo
    if (!doc.usada) {
      doc.usada = true;
      doc.hwid = hwid;

      if (doc.tipo === '7dias') {
        doc.expiraEm = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000);
      } else if (doc.tipo === '30dias') {
        doc.expiraEm = new Date(agora.getTime() + 30 * 24 * 60 * 60 * 1000);
      } else if (doc.tipo === 'vitalicio') {
        doc.expiraEm = null; // Sem expiração
      }

      await doc.save();
      const validadeMsg = doc.tipo === 'vitalicio' ? "VITALÍCIO" : doc.expiraEm.toLocaleDateString();
      return res.json({ ok: true, msg: `ATIVADO! VALIDADE: ${validadeMsg}` });
    }

    // 3. Verifica HWID (Bloqueia se tentar usar em outro PC)
    if (doc.hwid !== hwid) {
      return res.json({ ok: false, msg: "ESTA KEY JÁ ESTÁ EM USO EM OUTRO PC!" });
    }

    return res.json({ ok: true, msg: "ACESSO LIBERADO!" });
  } catch (err) {
    res.json({ ok: false, msg: "ERRO NO SERVIDOR" });
  }
});

app.listen(process.env.PORT || 3000);
