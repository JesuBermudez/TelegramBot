import { translate } from "@vitalets/google-translate-api";

export default async function translator(ctx) {
  const message = ctx.update.message; // message object
  const payload = ctx.payload.trim(); // text after the command
  let text = ""; // traduced text
  let replyId = message.message_id;

  // translate
  try {
    // if is reply to another message
    if (message.reply_to_message && message.reply_to_message.text) {
      text = (await translate(message.reply_to_message.text, { to: "es" }))
        .text;
      replyId = message.reply_to_message.message_id;
    } else if (payload.length > 0) {
      // if isn't empty
      text = (await translate(payload, { to: "es" })).text;
    } else {
      return;
    }

    ctx.reply(`🌐: ${text}`, {
      reply_to_message_id: replyId,
    });
  } catch (error) {
    console.log(error);
  }
}
