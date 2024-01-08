import Command from "./command.js";

export default class CommandList {
  constructor() {
    this.reserved = ["/start", "/help", "/all", "/purge"];
    this.list = {};
  }

  checkChatId(chatId) {
    return this.list.hasOwnProperty(chatId)
  }

  addChat(chatId) {
    this.list[chatId] = [
      new Command("text", "start", " "),
      new Command("text", "help", " "),
      new Command("text", "all", " "),
      new Command("any", "purge", " ")
    ];
  }

  addCommand(chatId, type, name, command, description = " ") {
    this.list[chatId].push(this.createCommand(type, name, command, description));
    return "added";
  }

  createCommand(type, name, command, description = " ") {
    return new Command(type, name, command, description);
  }

  removeCommand(chatId, name) {
    const index = this.list[chatId].findIndex((item) => item.name == name);

    if (!isNaN(parseFloat(index)) && index != -1) {
        this.list[chatId].splice(index, 1);
        return "removed";
    } else {
        return "command doesn't exist";
    }
  }

  findCommand(chatId, name) {
    const command = this.list[chatId].find((item) => item.name == name);

    if (command) {
      return command;
    } else {
      return "command doesn't exist";
    }
  }
}
