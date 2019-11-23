import CabinetInteractor from "../../cabinet-core/CabinetInteractor";
import BaseCommand from "./BaseCommand";
import { workspace, window } from "vscode";

export default class DeleteElementCommand extends BaseCommand {
    public static COMMAND_NAME = "okayishCabinet.deleteElement";
    private cabinetInteractor: CabinetInteractor;

    constructor(cabinetInteractor: CabinetInteractor) {
        super();
        this.cabinetInteractor = cabinetInteractor;
    }

    getCommandName(): string {
        return DeleteElementCommand.COMMAND_NAME;
    }

    getCommandAction(): (id: string) => Promise<void> {
        return async id => {
            const element = await this.cabinetInteractor.retrieveElement(id);
            const answer = await window.showQuickPick(
                ["Yes", "No"],
                {
                    placeHolder: `Are you sure to delete ${element.name}?`,
                    ignoreFocusOut: true
                }
            );
            
            if (answer?.startsWith("Yes")) {
                this.cabinetInteractor
                    .deleteElement(id)
                    .catch((err: { message: string; }) => {
                        window.showErrorMessage(err.message);
                    });
            }
        };
    }
}