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
    response =
      `*${data.location.name} / ${data.location.localtime.split(" ")[1]}*\n` +
      `🌡 *${Math.round(data.current.temp_c)}°*\n` +
      `*FeelsLike: ${Math.round(data.current.feelslike_c)}°*`;
  } catch (error) {
    response = "Error fetching weather data: " + error.message;
  }

  ctx.reply(response, {
    reply_to_message_id: messageId,
    parse_mode: "MarkdownV2",
  });
}
