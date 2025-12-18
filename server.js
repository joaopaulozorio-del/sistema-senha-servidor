const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());

// O nome do banco de dados vem logo após a barra "/" e antes do ponto de interrogação "?"
const mongoURI = "mongodb+srv://joaopaulozorio_db_user:5XBzTcqSHzuKf4UB@sistem-de-senhas.qxvgymx.mongodb.net/Teste?retryWrites=true&w=majority&appName=sistem-de-senhas";

mongoose.connect(mongoURI)
  .then(() => console.log("Conectado ao Banco de Dados: Teste"))
  .catch(err => console.error("Erro ao conectar:", err));

// Modelo de Key
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

    if (doc.tipo !== 'vitalicio' && doc.expiraEm && agora > doc.expiraEm) {
      return res.json({ ok: false, msg: "SUA KEY EXPIROU!" });
    }

    if (!doc.usada) {
      doc.usada = true;
      doc.hwid = hwid;

      if (doc.tipo === '7dias') {
        doc.expiraEm = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000);
      } else if (doc.tipo === '30dias') {
        doc.expiraEm = new Date(agora.getTime() + 30 * 24 * 60 * 60 * 1000);
      } else if (doc.tipo === 'vitalicio') {
        doc.expiraEm = null;
      }

      await doc.save();
      const validadeMsg = doc.tipo === 'vitalicio' ? "VITALÍCIO" : doc.expiraEm.toLocaleDateString();
      return res.json({ ok: true, msg: `ATIVADO! VALIDADE: ${validadeMsg}` });
    }

    if (doc.hwid !== hwid) {
      return res.json({ ok: false, msg: "USO EM OUTRO PC BLOQUEADO!" });
    }

    return res.json({ ok: true, msg: "ACESSO LIBERADO!" });
  } catch (err) {
    res.json({ ok: false, msg: "ERRO NO SERVIDOR" });
  }
});

app.listen(process.env.PORT || 3000);
