import { foreignExchange } from "../commands/exchangeRate";
import { all } from "../commands/mention";
import toPdf from "../commands/toPdf";
import translator from "../commands/translate";
import weather from "../commands/weather";
import downloader from "../commands/ytdl";

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
