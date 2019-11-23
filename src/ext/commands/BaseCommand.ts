import { commands, Disposable } from "vscode";

export default abstract class BaseCommand {
    abstract getCommandName(): string;
    abstract getCommandAction(): (...args: any[]) => any;

    public register(): Disposable {
        return commands.registerCommand(this.getCommandName(), this.getCommandAction());
    }
}