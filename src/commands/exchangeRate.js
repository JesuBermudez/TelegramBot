import axios from "axios";

export async function foreignExchange(ctx) {
  const payload = ctx.payload.trim().split(" ");
  const response = await fetchApi();
  let coin = "USD";
  let amount = 1;

  if (payload.length > 1) {
    coin = isNaN(payload[0]) ? payload[0].toUpperCase() : coin;
    amount = !isNaN(payload[1]) ? payload[1] : amount;
  } else if (payload.length == 1 && payload[0] != "" && isNaN(payload[0])) {
    coin = payload[0].toUpperCase();
  } else if (payload.length == 1 && payload[0] != "" && !isNaN(payload[0])) {
    amount = payload[0];
  }

  if (response == "Error") {
    ctx.reply("⚠ Error de la API");
  }

  const date = response.meta.last_updated_at.split("T");
  const strDate = date[0].split("-");
  const strHour = date[1].split(":");

  let value = response.data[coin];

  if (value == undefined) {
    value = response.data.USD.value;
    coin = "USD";
  } else {
    value = value.value;
  }

  if (coin == "COP") {
    value = 1;
  }

  ctx.reply(
    `*${strDate[2]}/${strDate[1]}/${strDate[0]}* \\- *${strHour[0]}:${strHour[1]}*\n` +
      `💵 *${coin}*: $${Math.floor(
        value * response.data.COP.value * amount
      ).toLocaleString()} COP`,
    { parse_mode: "MarkdownV2" }
  );
}

async function fetchApi() {
  let response = {};

  try {
    response = await axios.get(
      `https://api.currencyapi.com/v3/latest?apikey=${process.env.CURRENCY_API}`
    );

    return response.data;
  } catch (error) {
    return "Error";
  }
}
