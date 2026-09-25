const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const qrcode = require('qrcode');
const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require('@whiskeysockets/baileys');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// Casamento de telefone no mesmo padrão do CRM (últimos 8 dígitos numéricos).
function last8Digits(jid) {
  const digits = String(jid || '').replace(/\D/g, '');
  return digits.slice(-8);
}

async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(
    path.join(__dirname, 'auth_info')
  );

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      const qrImage = await qrcode.toDataURL(qr);
      io.emit('qr', qrImage);
    }

    if (connection === 'open') {
      io.emit('status', { connected: true });
      console.log('WhatsApp conectado.');
    }

    if (connection === 'close') {
      io.emit('status', { connected: false });
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(
        'Conexao fechada.',
        shouldReconnect ? 'Reconectando...' : 'Sessao deslogada.'
      );
      if (shouldReconnect) startWhatsApp();
    }
  });

  sock.ev.on('messages.upsert', ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const from = msg.key.remoteJid;
      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        '[mensagem sem texto]';

      io.emit('message', {
        from,
        last8: last8Digits(from),
        name: msg.pushName || from,
        text,
        timestamp: Number(msg.messageTimestamp) * 1000,
      });
    }
  });

  return sock;
}

startWhatsApp().catch((err) => {
  console.error('Erro ao iniciar WhatsApp:', err);
});

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
