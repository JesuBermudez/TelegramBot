export function sendLongMessage(bot, chatId, text, options = {}) {
  const LIMIT = 4096;
  const parts = [];

  while (text.length > 0) {
    if (text.length <= LIMIT) {
      parts.push(text);
      break;
    }

    // Cortar en el último \n antes del límite para no partir a la mitad una línea
    let cutAt = text.lastIndexOf("\n", LIMIT);
    if (cutAt === -1) cutAt = LIMIT; // si no hay salto de línea, cortar duro

    parts.push(text.slice(0, cutAt));
    text = text.slice(cutAt + 1);
  }

  return parts.reduce((promise, part) => {
    return promise.then(() => bot.telegram.sendMessage(chatId, part, options));
  }, Promise.resolve());
}
