import axios from "axios";
import handleMessageText from "../utils/handleMessageText.js";
import { escapeMarkdownV2 } from "../utils/escapeMarkdownV2.js";

export default async function weather(ctx) {
  let response = "";
  const messageId = ctx.update.message.message_id;
  const { text } = handleMessageText(ctx.update.message);
  const city = text.trim().split(" ")[0] || "Valledupar";

  // make the request to the api
  try {
    const { data } = await axios.get(
      `https://wttr.in/${city}?m&format=%22%l+/+%T%5Cn+%c%t%5Cn+FeelsLike:+%f%22`,
      {
        responseType: "text",
        validateStatus: () => true,
        headers: {
          "User-Agent": "curl/8.7.1",
          Accept: "*/*",
        },
      },
    );
    response = formatWeather(data);
  } catch (error) {
    response = "Error fetching weather data: " + error.message;
  }

  ctx.reply(`*${escapeMarkdownV2(response)}*`, {
    reply_to_message_id: messageId,
    parse_mode: "MarkdownV2",
  });
}

function formatWeather(str) {
  // quitar comillas externas si las tiene
  str = str.replace(/^"|"$/g, "");

  return (
    str
      // hora: extraer HH:MM y convertir a 12h  (ej: 17:29:44-0500 -> 5:29 PM)
      .replace(/(\d{2}):(\d{2}):\d{2}[+-]\d{4}/, (_, hh, mm) => {
        const h = parseInt(hh);
        const suffix = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        return `${h12}:${mm} ${suffix}`;
      })
      // quitar los "+"
      .replace(/\+/g, "")
      // primera letra en mayúscula
      .replace(/^./, (c) => c.toUpperCase())
  );
}
