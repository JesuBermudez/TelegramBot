import fs from "fs";
import handleMessageText from "../utils/handleMessageText.js";
import { fetchWithRetry } from "../utils/fetchWithRetray.js";
import { escapeMarkdownV2 } from "../utils/escapeMarkdownV2.js";

const MAX_TELEGRAM_BOT_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export default async function downloader(ctx, bot) {
  const { text } = handleMessageText(ctx.update.message); // command string and text
  const messageContent = text.trim(" ").split(" ");
  const chatId = ctx.update.message.chat.id;
  const msgId = ctx.update.message.message_id;

  if (!(messageContent[0].length > 22)) {
    try {
      ctx.react("😡");
    } catch (error) {}
    return;
  }

  const loadingMsg = await ctx.reply("⏳ Espere...");
  const tempVideoPath = `src/temp/video_${Date.now()}_${msgId}.mp4`;

  // Status updates should never abort the download if Telegram rate-limits (429) or message was deleted
  const safeEditStatus = async (statusText) => {
    try {
      await bot.telegram.editMessageText(
        chatId,
        loadingMsg.message_id,
        null,
        statusText,
      );
    } catch (e) {
      // Ignore 429 rate limits or edit errors on transient status messages
    }
  };

  setImmediate(async () => {
    try {
      await safeEditStatus("⏳ Descargando...");

      // Download the video using the downloader API
      const response = await fetchWithRetry(
        `${process.env.DOWNLOADER_API}/api/v1/download?postUrl=${encodeURI(messageContent[0])}`,
      );

      await safeEditStatus("⚙ Procesando...");

      // Ensure temp directory exists
      if (!fs.existsSync("src/temp")) {
        fs.mkdirSync("src/temp", { recursive: true });
      }

      fs.writeFileSync(tempVideoPath, Buffer.from(response.data));

      const stats = fs.statSync(tempVideoPath);
      if (stats.size > MAX_TELEGRAM_BOT_FILE_SIZE) {
        const sizeMb = (stats.size / (1024 * 1024)).toFixed(1);
        await ctx.reply(
          `⚠️ El video pesa ${sizeMb} MB y supera el límite de 50 MB permitido por Telegram para bots.`,
          { reply_to_message_id: msgId },
        );
        return;
      }

      await safeEditStatus("📤 Enviando...");

      const fromUser = ctx.update.message.from;
      const username = fromUser.username
        ? `@${fromUser.username}`
        : [fromUser.first_name, fromUser.last_name].filter(Boolean).join(" ") ||
          "Usuario";
      const userText = messageContent.slice(1).join(" ").trim();

      const captionMarkdown = userText
        ? `*${escapeMarkdownV2(username)}*: ${escapeMarkdownV2(userText)}`
        : `*${escapeMarkdownV2(username)}*`;

      try {
        await ctx.replyWithVideo(
          { source: tempVideoPath },
          {
            caption: captionMarkdown,
            parse_mode: "MarkdownV2",
            supports_streaming: true,
          },
        );
      } catch (videoError) {
        // Fallback without parse_mode if MarkdownV2 entity parsing failed
        const plainCaption = userText ? `${username}: ${userText}` : username;
        await ctx.replyWithVideo(
          { source: tempVideoPath },
          {
            caption: plainCaption,
            supports_streaming: true,
          },
        );
      }

      try {
        await bot.telegram.deleteMessage(chatId, msgId);
      } catch (deleteError) {}
    } catch (error) {
      let errorMsg = "⚠ Error al descargar el video.";

      if (error.code === "ECONNABORTED") {
        errorMsg =
          "⏳ El servidor tardó demasiado en responder. Intenta nuevamente.";
      } else if (
        error.response?.error_code === 413 ||
        error.response?.description?.includes("Request Entity Too Large")
      ) {
        errorMsg =
          "⚠️ El video supera el límite de 50 MB permitido por Telegram para bots.";
      } else if (error.response?.data) {
        let serverError = "";
        try {
          const raw = Buffer.from(error.response.data).toString("utf-8");
          const json = JSON.parse(raw);
          if (json.error) serverError = json.error;
        } catch {}

        if (serverError) {
          errorMsg += `\nServidor: ${serverError}`;
        } else if (error.response.status) {
          errorMsg += `\nServidor: ${error.response.status} ${error.response.statusText || ""}`.trim();
        }
      } else if (error.response?.description) {
        errorMsg += `\nTelegram: ${error.response.error_code} ${error.response.description}`;
      } else if (error.message) {
        errorMsg += `\nDetalle: ${error.message}`;
      }

      try {
        await ctx.reply(errorMsg, {
          reply_to_message_id: msgId,
        });
      } catch (replyError) {}
    } finally {
      try {
        if (fs.existsSync(tempVideoPath)) {
          fs.unlinkSync(tempVideoPath);
        }
      } catch (cleanError) {}

      try {
        await bot.telegram.deleteMessage(chatId, loadingMsg.message_id);
      } catch (delError) {}
    }
  });
}
