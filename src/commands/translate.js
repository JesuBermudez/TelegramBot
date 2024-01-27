import { translate } from "@vitalets/google-translate-api";

export default async function translator(ctx) {
  // text after the command
  const payload = ctx.payload.trim();

  // if is empty
  if (payload.length < 1) return;

  // translate
  try {
    const { text } = await translate(payload, { to: "es" });

    ctx.reply(`🌐: ${text}`, {
      reply_to_message_id: ctx.update.message.message_id,
    });
  } catch (error) {
    console.log(error);
  }
}
