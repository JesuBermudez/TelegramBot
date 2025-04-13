import { translate } from "@vitalets/google-translate-api";
import handleMessageText from "../utils/handleMessageText";

export default async function translator(ctx) {
  const { text } = handleMessageText(ctx); // command string and text
  const message = ctx.update.message; // message object
  let traduced = ""; // traduced text
  let replyId = message.message_id;

  // translate
  try {
    // if is reply to another message
    if (text) {
      traduced = await translate(text, { to: "es" });
    } else if (message.reply_to_message) {
      const msg =
        message.reply_to_message.text || message.reply_to_message.caption;

      if (!msg) return; // no message to translate

      traduced = await translate(message.reply_to_message.text, { to: "es" });
      replyId = message.reply_to_message.message_id;
    } else {
      return;
    }

    ctx.reply(`🌐: ${traduced.text}`, {
      reply_to_message_id: replyId,
    });
  } catch (error) {
    console.log(error);
  }
}
