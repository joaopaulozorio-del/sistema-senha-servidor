const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());

const mongoURI = "mongodb+srv://joaopaulozorio_db_user:5XBzTcqSHzuKf4UB@sistem-de-senhas.qxvgymx.mongodb.net/Test?retryWrites=true&w=majority&appName=sistem-de-senhas";

mongoose.connect(mongoURI).then(() => console.log("MongoDB Online!"));

const Senha = mongoose.model("Senha", new mongoose.Schema({
  codigo: String,
  usada: { type: Boolean, default: false },
  hwid: String,
  expiraEm: Date
}, { collection: 'senhas' }));

app.post("/validar", async (req, res) => {
  const { senha, hwid } = req.body;
  try {
    const doc = await Senha.findOne({ codigo: senha.trim() });
    if (!doc) return res.json({ ok: false, msg: "KEY INVÁLIDA!" });

    const agora = new Date();
    if (doc.expiraEm && agora > doc.expiraEm) return res.json({ ok: false, msg: "KEY EXPIRADA!" });

    if (!doc.usada) {
      doc.usada = true;
      doc.hwid = hwid;
      doc.expiraEm = new Date(agora.getTime() + 24 * 60 * 60 * 1000); // 24h
      await doc.save();
      return res.json({ ok: true, msg: "KEY ATIVADA! BEM-VINDO." });
    }

    if (doc.hwid !== hwid) return res.json({ ok: false, msg: "USO EM OUTRO PC BLOQUEADO!" });

    return res.json({ ok: true, msg: "ACESSO LIBERADO!" });
  } catch (err) {
    res.json({ ok: false, msg: "ERRO NO SERVIDOR" });
  }
});

app.listen(process.env.PORT || 3000);
