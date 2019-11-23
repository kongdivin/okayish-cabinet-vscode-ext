import { commands } from "vscode";
import UriProvider from "../UriProvider";
import BaseCommand from "./BaseCommand";
import Commands from "./Commands";

export default class PreviewPageCommand extends BaseCommand {
    public static COMMAND_NAME = "okayishCabinet.previewPage";
    private uriProvider: UriProvider;

    constructor(uriProvider: UriProvider) {
        super();
        this.uriProvider = uriProvider;
    }

    getCommandName(): string {
        return PreviewPageCommand.COMMAND_NAME;
    }

    getCommandAction(): (id: string) => void {
        return id => {
            commands.executeCommand(
                Commands.MARKDOWN_SHOW_PREVIEW,
                this.uriProvider.computeUri(id)
            );
        };
    }
}