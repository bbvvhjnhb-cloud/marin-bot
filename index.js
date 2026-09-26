import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";

import P from "pino";
import qrcode from "qrcode-terminal";

async function startMarin() {
  console.log("🎀 تشغيل مارين...");

  const { state, saveCreds } =
    await useMultiFileAuthState("auth_info");

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" }),
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on(
    "connection.update",
    ({ connection, lastDisconnect, qr }) => {

      if (qr) {
        console.log("");
        console.log("🎀🎀🎀 QR مارين 🎀🎀🎀");
        qrcode.generate(qr, { small: true });
        console.log("");
      }

      if (connection === "open") {
        console.log("✅ مارين متصلة بواتساب بنجاح 🎀");
      }

      if (connection === "close") {
        const statusCode =
          lastDisconnect?.error?.output?.statusCode;

        if (statusCode !== DisconnectReason.loggedOut) {
          console.log("🔄 الاتصال انقطع، إعادة الاتصال...");
          startMarin();
        } else {
          console.log("❌ تم تسجيل خروج حساب واتساب.");
        }
      }
    }
  );

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];

    if (!msg?.message) return;
    if (msg.key.fromMe) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    const chat = msg.key.remoteJid;

    if (!chat) return;

    if (text.trim() === ".مارين") {
      await sock.sendMessage(chat, {
        text:
          "🎀 أهلاً! أنا مارين 💕\n\n" +
          "اكتبي:\n" +
          ".مارين قائمة\n\n" +
          "لمشاهدة أوامري 🌸"
      });
    }

    if (text.trim() === ".مارين قائمة") {
      await sock.sendMessage(chat, {
        text:
`🎀 ━━━ قائمة مارين ━━━ 🎀

🌸 .مارين
📋 .مارين قائمة
❓ .مارين مساعدة
🎌 .مارين انمي
🖼️ .مارين صورة <اسم>

💕 مارين جاهزة!`
      });
    }

    if (text.trim() === ".مارين مساعدة") {
      await sock.sendMessage(chat, {
        text:
          "💕 طريقة الاستخدام:\n\n" +
          "اكتبي .مارين قائمة لرؤية جميع الأوامر 🎀"
      });
    }

    if (text.trim() === ".مارين انمي") {
      await sock.sendMessage(chat, {
        text:
          "🎌 قسم الأنمي قادم يا يامورتي! 🎀\n" +
          "بنضيف له البحث والشخصيات والصور لاحقًا."
      });
    }
  });
}

startMarin();
