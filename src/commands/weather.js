import axios from "axios";

export default async function weather(ctx) {
  let response = {};
  const messageId = ctx.update.message.message_id;

  // make the request to the api
  try {
    const { data } = await axios.get(
      "https://weatherapi-com.p.rapidapi.com/current.json",
      {
        params: {
          q: "10.4626644,-73.2544279",
        },
        headers: {
          "X-RapidAPI-Key": process.env.WEATHER_API,
          "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
        },
      }
    );
    response = data;
  } catch (error) {
    response = "api error";
  }

  // if an error occurred
  if (response == "api error") return;

  ctx.reply(
    `*${response.location.name} / ${
      response.location.localtime.split(" ")[1]
    }*\n` +
      `🌡 *${Math.round(response.current.temp_c)}°*\n` +
      `*FeelsLike: ${Math.round(response.current.feelslike_c)}°*`,
    {
      reply_to_message_id: messageId,
      parse_mode: "MarkdownV2",
    }
  );
}
