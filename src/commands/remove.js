import axios from "axios";

export default async function remove(ctx, bot) {
  const messageId = ctx.update.message.message_id;
  const chatId = ctx.update.message.chat.id;
  const user = ctx.update.message.from.username;
  const payload = ctx.payload.trim().split(" "); // array of text (where should be the command)
  let response = {}; // api response

  // message hasn't a command name
  if (payload.length < 1) {
    ctx.reply(
      "⚠ *Atención:* Por favor introduce el nombre del comando despues de /remove\nPor ejemplo: `/remove command`",
      { parse_mode: "MarkdownV2", reply_to_message_id: messageId }
    );
    return;
  }

  // verify that the member is an admin
  const chatMember = await bot.telegram.getChatMember(
    chatId,
    ctx.update.message.from.id
  );

  // user role
  const role = ["administrator", "creator"].includes(chatMember.status)
    ? "admin"
    : "user";

  // api request
  try {
    response = await axios.delete(
      `${process.env.API}/command/${chatId}/${user}/${role}`,
      {
        data: {
          name: payload[0],
        },
      }
    );

    // command deleted
    if (response.data.message == "Command deleted") {
      ctx.reply("✨ *El comando ha sido eliminado\\!*", {
        parse_mode: "MarkdownV2",
        reply_to_message_id: messageId,
      });
    }
  } catch (error) {
    // error handling
    switch (error.response.data.error) {
      case "You dont have authorization to delete the command":
        ctx.reply("⚠ Solo *Administradores* o *Propietario* del comando\\.", {
          parse_mode: "MarkdownV2",
          reply_to_message_id: messageId,
        });
        break;
      case "chat not found":
        ctx.reply(
          "⚠ *Atención:* No hay comandos aún\\, trata creando alguno\\.",
          {
            parse_mode: "MarkdownV2",
            reply_to_message_id: messageId,
          }
        );
        break;

      case "Command not found":
        ctx.reply("⚠ *Atención:* Comando no existe\\.", {
          parse_mode: "MarkdownV2",
          reply_to_message_id: messageId,
        });
        break;
    }
  }
}
