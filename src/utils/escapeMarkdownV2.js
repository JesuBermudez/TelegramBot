export function escapeMarkdownV2(text = "") {
  return String(text).replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}
