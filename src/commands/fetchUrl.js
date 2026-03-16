import axios from "axios";

export async function fetchUrlAsString(ctx) {
  const chatId = ctx.update.message.chat.id;
  const message = ctx.update.message;
  const url = message.text.split(" ")[1];
  let response;

  if (!url || !/^https?:\/\//i.test(url)) {
    ctx.reply(
      "Por favor, proporciona una URL válida que comience con http:// o https://",
    );
    return;
  }

  try {
    response = await axios.get(url, {
      responseType: "text",
      validateStatus: () => true,
      headers: {
        "User-Agent": "curl/8.7.1",
        Accept: "*/*",
      },
    });

    if (response.status >= 200 && response.status < 300) {
      try {
        response = JSON.stringify(
          JSON.parse(response.data.toString()),
          null,
          2,
        );
      } catch {
        response = response.data.toString();
      }
    } else {
      response = `Error ${response.status}: ${response.statusText}\n${response.data}`;
    }
  } catch (err) {
    response = `Request failed: ${err.message}`;
  }

  // cortar si es demasiado largo
  if (response.length > 4000) {
    response = response.slice(0, 4000) + "\n\n...[truncated]";
  }

  // delete the main message
  try {
    await bot.telegram.deleteMessage(chatId, message.message_id);
  } catch (error) {}

  ctx.reply(`<${url}> \n---\n${response}`);
}
