export default async function laughter(ctx, bot) {
  const mainId = ctx.update.message.message_id; // main message id
  const chatId = ctx.update.message.chat.id;
  const user = ctx.update.message.from.username;
  const rightText = ctx.payload.trim().split(" "); // what follows after the command

  let count = 24; // number of characters
  let result = ""; // final result
  let replyId = false; // id of the message that is replying to
  let extra = ""; // extra message

  // delete the main message
  await bot.telegram.deleteMessage(chatId, mainId);

  // if is replying to another message
  if (ctx.update.message.hasOwnProperty("reply_to_message")) {
    replyId = ctx.update.message.reply_to_message.message_id;
  }

  // if number of characters indicated
  if (rightText[0] && !isNaN(rightText[0])) {
    // number of letters
    count = Math.abs(Math.floor(rightText[0]));
    // extra message
    extra = rightText.length > 1 ? rightText.slice(1).join(" ") : "";
    // if it is too long
    count = count < 1000 ? count : 999;
  }

  const letters = ["J", "A", "S"];

  // make the string
  for (let i = 0; i < count; i++) {
    // random letter of the array
    let newLetter = letters[Math.floor(Math.random() * 3)];

    switch (result.length) {
      case 0:
        // assigns the "J"
        result = letters[0];
        break;
      case 1:
        // assigns the random letter
        result = result + newLetter;
        break;
      default:
        // the last two of the string
        let lastTwo = result.slice(result.length - 2);
        // verify that there are no three repeats
        if (newLetter != lastTwo[0] || newLetter != lastTwo[1]) {
          result = result + newLetter;
        } else {
          i--;
        }
        break;
    }
  }

  // send the message
  if (replyId) {
    ctx.reply(`De: @${user}, ${extra} ${result}`, {
      reply_to_message_id: replyId,
    });
  } else {
    ctx.reply(`De: @${user}, ${extra} ${result}`);
  }
}
