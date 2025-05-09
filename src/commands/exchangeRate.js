import axios from "axios";
import handleMessageText from "../utils/handleMessageText.js";

export async function foreignExchange(ctx) {
  const { text } = handleMessageText(ctx.update.message); // command string and text
  const payload = text.trim().split(" ");
  const response = await fetchApi();
  let coin = "USD";
  let amount = 1;

  // si el primer argumento es caracteres
  if (payload[0] && isNaN(payload[0])) {
    coin = payload[0].toUpperCase();
  }

  // si hay segundo argumento y es numerico
  if (payload.length > 1 && !isNaN(payload[1])) {
    amount = payload[1];
  }

  if (payload[0] && !isNaN(payload[0])) {
    amount = payload[0];
  }

  if (response == "Error") {
    ctx.reply("⚠ Error de la API");
  }

  const date = response.meta.last_updated_at.split("T");
  const strDate = date[0].split("-");
  const strHour = date[1].split(":");

  let value = response.data[coin]?.value;

  if (value == undefined) {
    value = response.data.USD.value;
    coin = "USD";
  }

  if (coin == "COP") {
    value = 1;
  }

  // primera posicion los numeros enteros y en la segunda los decimales
  const aux = (value * response.data.COP.value * amount).toString().split(".");

  // la cadena de los enteros a un array por cada numero, en reversa
  // por cada 3 y si no es el ultimo, se le agrega \\. + v
  // sino, el mismo valor, en reversa de nuevo y se une
  const integers = aux[0]
    .split("")
    .reverse()
    .map((v, i) => {
      if ((i + 1) % 3 === 0 && i !== aux[0].length - 1) {
        return "\\." + v;
      } else {
        return v;
      }
    })
    .reverse()
    .join("");

  // se convierte la parte decimal a float y se corta a solo
  // 2 numeros despues del punto, para despues dividir el string
  // en .split(".") para solo tener los 2 numeros despues del .
  const decimals = parseFloat(`0.${aux[1]}`).toFixed(2);

  ctx.reply(
    `*${strDate[2]}/${strDate[1]}/${strDate[0]}* \\- *${strHour[0]}:${strHour[1]}*\n` +
      `💵 *${coin}*: $${integers},${decimals.split(".")[1]} COP`,
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
