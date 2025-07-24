export default function getCommandType(message) {
  if (message.reply_to_message.sticker) {
    return {
      type: "sticker",
      command: message.reply_to_message.sticker.file_id,
    };
  }
  if (message.reply_to_message.photo) {
    return {
      type: "photo",
      command: message.reply_to_message.photo.at(-1).file_id,
    };
  }
  if (message.reply_to_message.text) {
    return { type: "text", command: message.reply_to_message.text };
  }
  if (message.reply_to_message.audio) {
    return {
      type: "audio",
      command: message.reply_to_message.audio.file_id,
      description: message.reply_to_message.audio.file_name,
    };
  }
  if (message.reply_to_message.document) {
    return {
      type: "document",
      command: message.reply_to_message.document.file_id,
      description: message.reply_to_message.document.file_name,
    };
  }
  if (message.reply_to_message.video) {
    return {
      type: "video",
      command: message.reply_to_message.video.file_id,
      description: message.reply_to_message.video.file_name,
    };
  }
  return { type: "not available", command: "" };
}
