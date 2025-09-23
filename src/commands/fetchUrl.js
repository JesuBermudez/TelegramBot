import axios from "axios";

/**
 * Hace una petición GET a la URL indicada y retorna data o error como string.
 * @param {string} url - URL a la que se hará la petición
 * @returns {Promise<string>}
 */
export async function fetchUrlAsString(ctx) {
  const chatId = ctx.update.message.chat.id;
  const message = ctx.update.message;
  const url = message.text.split(" ")[1];
  let response;

  if (!url || !/^https?:\/\//i.test(url)) {
    ctx.reply(
      "Por favor, proporciona una URL válida que comience con http:// o https://"
    );
    return;
  }

  try {
    response = await axios.get(url, {
      responseType: "text",
      validateStatus: () => true,
    });

    if (response.status >= 200 && response.status < 300) {
      response = JSON.stringify(JSON.parse(response.data.toString()), null, 2);
    } else {
      response = `Error ${response.status}: ${response.statusText}\n${response.data}`;
    }
  } catch (err) {
    response = `Request failed: ${err.message}`;
  }

  // delete the main message
  try {
    await bot.telegram.deleteMessage(chatId, message.message_id);
  } catch (error) {}

  ctx.reply(`<${url}> \n---\n${response}`);
}
