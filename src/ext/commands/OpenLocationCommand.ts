import { commands } from "vscode";
import UriProvider from "../UriProvider";
import BaseCommand from "./BaseCommand";
import Commands from "./Commands";

export default class OpenLocationCommand extends BaseCommand {
    public static COMMAND_NAME = "okayishCabinet.openLocation";
    private uriProvider: UriProvider;

    constructor(uriProvider: UriProvider) {
        super();
        this.uriProvider = uriProvider;
    }

    getCommandName(): string {
        return OpenLocationCommand.COMMAND_NAME;
    }

    getCommandAction(): (id: string) => void {
        return id => {
            commands.executeCommand(
								Commands.REVEAL,
								this.uriProvider.computeUri(id)
            );
        };
    }
}