import { foreignExchange } from "../commands/exchangeRate.js";
import { all } from "../commands/mention.js";
import toPdf from "../commands/toPdf.js";
import translator from "../commands/translate.js";
import weather from "../commands/weather.js";
import downloader from "../commands/ytdl.js";

export default function handleCaptionCommand(ctx, bot, commandString) {
  switch (commandString) {
    case "/all":
      all(ctx, bot);
      break;
    case "/tr":
      translator(ctx);
      break;
    case "/pdf":
      toPdf(ctx, bot);
      break;
    case "/clima":
      weather(ctx);
      break;
    case "/coin":
      foreignExchange(ctx);
      break;
    case "/get":
      downloader(ctx, bot);
      break;
    default:
      return false; // no caption command
  }
  return true; // caption command found
}
