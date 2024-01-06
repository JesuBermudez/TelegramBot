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