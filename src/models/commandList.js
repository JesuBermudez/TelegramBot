<<<<<<< HEAD
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
      new Command("start", " "),
      new Command("help", " "),
      new Command("all", " "),
      new Command("purge", " ")
    ];
  }

  addCommand(chatId, name, command, description = " ") {
    this.list[chatId].push(this.createCommand(name, command, description));
    return "added";
  }

  createCommand(name, command, description = " ") {
    return new Command(name, command, description);
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
=======
import Command from "./command.js"

export default class CommandList {
    constructor() {
        this.reserved = ["/start", "/help", "/all", "/purge"]
        this.list = [new Command("start", ""), new Command("help", ""), new Command("all", ""), new Command("purge", "")]
    }

    setList(newList) {
        this.list = newList
        return "changed"
    }

    addCommand(name, command, description = "") {
        this.list.push(new Command(name, command, description))
        return "added"
    }

    removeCommand(name) {
        const index = this.list.findIndex((item) => item.name == name)

        if (index == -1) {
            return "command doesn't exist"
        } else {
            this.list.splice(index, 1)
            return "removed"
        }
    }

    findCommand(name) {
        const command = this.list.find((item) => item.name == name)

        if (command) {
            return command
        } else {
            return "command doesn't exist"
        }
    }
}
>>>>>>> 3680edd9d7cad70b3e1ce1db3c53650f441aae31
