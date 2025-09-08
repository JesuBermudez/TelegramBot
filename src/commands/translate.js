import { translate } from "@vitalets/google-translate-api";
import handleMessageText from "../utils/handleMessageText.js";

export default async function translator(ctx) {
  const message = ctx.update.message; // message object
  const { text } = handleMessageText(message); // command string and text
  let traduced = ""; // traduced text
  let replyId = message.message_id;

  // translate
  try {
    if (text) {
      traduced = await translate(text, { to: "es" });
    } else if (message.reply_to_message) {
      // if is reply to another message
      const msg = handleMessageText(message.reply_to_message).text;

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
