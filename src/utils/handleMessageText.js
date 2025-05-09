export default function handleMessageText(message) {
  let text = message.text || message.caption || "";
  const textArray = text.trim().split(/\s+/);
  let cmd = textArray[0];

  if (cmd.startsWith("/") && textArray.length > 1) {
    text = textArray.slice(1).join(" ");
  }

  if (!cmd.startsWith("/")) cmd = "";

  return {
    cmd,
    text,
    isBot: message.from.is_bot,
  };
}
