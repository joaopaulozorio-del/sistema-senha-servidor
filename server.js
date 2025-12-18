const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());

// Sua URL do MongoDB
const mongoURI = "mongodb+srv://joaopaulozorio_db_user:5XBzTcqSHzuKf4UB@sistem-de-senhas.qxvgymx.mongodb.net/Test?retryWrites=true&w=majority&appName=sistem-de-senhas";

mongoose.connect(mongoURI).then(() => console.log("MongoDB Conectado!"));

const Senha = mongoose.model("Senha", new mongoose.Schema({
  codigo: String, 
  usada: { type: Boolean, default: false }, 
  hwid: String, 
  expiraEm: Date,
  tipo: { type: String, enum: ['7dias', '30dias', 'vitalicio'], default: '30dias' } 
}, { collection: 'senhas' }));

app.post("/validar", async (req, res) => {
  const { senha, hwid } = req.body; // Recebe 'senha' do script
  try {
    const doc = await Senha.findOne({ codigo: senha.trim() });
    if (!doc) return res.json({ sucesso: false, mensagem: "KEY INVÁLIDA!" });

    const agora = new Date();

    if (doc.tipo !== 'vitalicio' && doc.expiraEm && agora > doc.expiraEm) {
      return res.json({ sucesso: false, mensagem: "ESTA KEY JÁ EXPIROU!" });
    }

    if (!doc.usada) {
      doc.usada = true;
      doc.hwid = hwid;
      if (doc.tipo === '7dias') doc.expiraEm = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000);
      else if (doc.tipo === '30dias') doc.expiraEm = new Date(agora.getTime() + 30 * 24 * 60 * 60 * 1000);
      await doc.save();
      return res.json({ sucesso: true, mensagem: "KEY ATIVADA COM SUCESSO!" });
    }

    if (doc.hwid !== hwid) {
      return res.json({ sucesso: false, mensagem: "KEY EM USO EM OUTRO PC!" });
    }

    return res.json({ sucesso: true, mensagem: "ACESSO LIBERADO!" });

  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: "ERRO NO SERVIDOR" });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("Servidor Online!"));const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());

// Sua URL do MongoDB
const mongoURI = "mongodb+srv://joaopaulozorio_db_user:5XBzTcqSHzuKf4UB@sistem-de-senhas.qxvgymx.mongodb.net/Test?retryWrites=true&w=majority&appName=sistem-de-senhas";

mongoose.connect(mongoURI).then(() => console.log("MongoDB Conectado!"));

const Senha = mongoose.model("Senha", new mongoose.Schema({
  codigo: String, 
  usada: { type: Boolean, default: false }, 
  hwid: String, 
  expiraEm: Date,
  tipo: { type: String, enum: ['7dias', '30dias', 'vitalicio'], default: '30dias' } 
}, { collection: 'senhas' }));

app.post("/validar", async (req, res) => {
  const { senha, hwid } = req.body; // Recebe 'senha' do script
  try {
    const doc = await Senha.findOne({ codigo: senha.trim() });
    if (!doc) return res.json({ sucesso: false, mensagem: "KEY INVÁLIDA!" });

    const agora = new Date();

    if (doc.tipo !== 'vitalicio' && doc.expiraEm && agora > doc.expiraEm) {
      return res.json({ sucesso: false, mensagem: "ESTA KEY JÁ EXPIROU!" });
    }

    if (!doc.usada) {
      doc.usada = true;
      doc.hwid = hwid;
      if (doc.tipo === '7dias') doc.expiraEm = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000);
      else if (doc.tipo === '30dias') doc.expiraEm = new Date(agora.getTime() + 30 * 24 * 60 * 60 * 1000);
      await doc.save();
      return res.json({ sucesso: true, mensagem: "KEY ATIVADA COM SUCESSO!" });
    }

    if (doc.hwid !== hwid) {
      return res.json({ sucesso: false, mensagem: "KEY EM USO EM OUTRO PC!" });
    }

    return res.json({ sucesso: true, mensagem: "ACESSO LIBERADO!" });

  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: "ERRO NO SERVIDOR" });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("Servidor Online!"));
