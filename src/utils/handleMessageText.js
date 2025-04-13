export default function handleMessageText(ctx) {
  let text = ctx.update.message.text || ctx.update.message.caption || "";
  const textArray = text.trim().split(/\s+/);
  const commandString = textArray[0] || "";
  text = textArray.length > 1 ? textArray.slice(1).join(" ") : "";

  return {
    commandString,
    text,
  };
}
