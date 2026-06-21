export function escapeMarkdownV2(text = "", markdown = false) {
  const value = String(text);

  if (markdown) return value.replace(/[\[\]()~>#+\-=|{}.!]/g, "\\$&");

  return value.replace(/[_*\[\]()`~>#+\-=|{}.!]/g, "\\$&");
}
