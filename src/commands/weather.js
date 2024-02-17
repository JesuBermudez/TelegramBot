import axios from "axios";

export default async function weather(ctx) {
  let response = {};

  // make the request to the api
  try {
    const { data } = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=10.4626644&lon=-73.2544279&appid=${process.env.WEATHERKEY}`
    );
    response = data;
  } catch (error) {
    response = "api error";
    console.log(error);
  }

  // if an error occurred
  if (response == "api error") return;

  console.log(response);

  // ctx.reply();
}
