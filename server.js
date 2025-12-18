const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());

const mongoURI = "mongodb+srv://joaopaulozorio_db_user:5XBzTcqSHzuKf4UB@sistem-de-senhas.qxvgymx.mongodb.net/Test?retryWrites=true&w=majority&appName=sistem-de-senhas";

mongoose.connect(mongoURI).then(() => console.log("MongoDB Conectado!"));

// Modelo atualizado para incluir o tipo de plano
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

    // Verifica se já expirou (apenas para quem não é vitalício)
    if (doc.tipo !== 'vitalicio' && doc.expiraEm && agora > doc.expiraEm) {
      return res.json({ ok: false, msg: "ESTA KEY JÁ EXPIROU!" });
    }

    // Primeiro uso: Ativa a Key e define o tempo
    if (!doc.usada) {
      doc.usada = true;
      doc.hwid = hwid;
      
      if (doc.tipo === '7dias') {
        doc.expiraEm = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000);
      } else if (doc.tipo === '30dias') {
        doc.expiraEm = new Date(agora.getTime() + 30 * 24 * 60 * 60 * 1000);
      } else {
        doc.expiraEm = null; // Vitalício não tem data de expiração
      }

      await doc.save();
      const tempoMsg = doc.tipo === 'vitalicio' ? "VITALÍCIO" : (doc.tipo === '7dias' ? "7 DIAS" : "30 DIAS");
      return res.json({ ok: true, msg: `KEY ATIVADA! PLANO: ${tempoMsg}` });
    }

    // Verifica se o HWID bate
    if (doc.hwid !== hwid) return res.json({ ok: false, msg: "KEY VINCULADA A OUTRO PC!" });

    res.json({ ok: true, msg: "BEM-VINDO DE VOLTA!" });
  } catch (e) { res.json({ ok: false, msg: "ERRO NO SERVIDOR" }); }
});

app.listen(process.env.PORT || 10000);
