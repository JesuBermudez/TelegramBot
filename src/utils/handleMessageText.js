export default function handleMessageText(message) {
  let text = message.text || message.caption || "";
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
    isBot: message.from.is_bot,
  };
}
