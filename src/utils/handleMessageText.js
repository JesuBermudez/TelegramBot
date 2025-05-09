export default function handleMessageText(ctx) {
  let text = ctx.update.message.text || ctx.update.message.caption || "";
  const textArray = text.trim().split(/\s+/);
  let cmd = textArray[0];

  if (textArray.length > 1) {
    if (cmd.startsWith("/")) {
      text = textArray.slice(1).join(" ");
    } else {
      cmd = "";
    }
  }

  return {
    cmd,
    text,
    isBot: ctx.update.message.from.is_bot,
  };
}
