import BaseCommand from "./BaseCommand";
import { EventEmitter } from "vscode";

export default class RefreshNotebookCommand extends BaseCommand {
    public static COMMAND_NAME = "okayishCabinet.refreshNotebook";
    public notebookEventEmitter: EventEmitter<string>;

    constructor(notebookEventEmitter: EventEmitter<string>) {
        super();
        this.notebookEventEmitter = notebookEventEmitter;
    }

    getCommandName(): string {
        return RefreshNotebookCommand.COMMAND_NAME;
    }    
    
    getCommandAction(): () => void{
        return () => {
            this.notebookEventEmitter.fire();
        };
    }
}