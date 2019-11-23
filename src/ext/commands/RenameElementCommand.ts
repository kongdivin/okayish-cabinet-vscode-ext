import { window } from "vscode";
import CabinetInteractor from "../../cabinet-core/CabinetInteractor";
import BaseCommand from "./BaseCommand";

const nameRegExp = new RegExp('^[\\w\\s-]+$');

export default class RenameElementCommand extends BaseCommand {
    public static COMMAND_NAME = "okayishCabinet.renameElement";
    private cabinetInteractor: CabinetInteractor;

    constructor(cabinetInteractor: CabinetInteractor) {
        super();
        this.cabinetInteractor = cabinetInteractor;
    }

    getCommandName(): string {
        return RenameElementCommand.COMMAND_NAME;
    }

    getCommandAction(): (id: string) => Promise<void> {
        return async id => {
            const newName = await window.showInputBox({
                prompt: `Be creative! 😉`,
                placeHolder: "Give it a new name",
                ignoreFocusOut: true,
                validateInput: (value: string): string | undefined => {
                    if (nameRegExp.test(value.trim())) {
                        return;
                    }

                    return `Sorry, this is not a valid name. 
                    Use only a-z, A-Z, 0-9, including whitespace, _ (underscore) and - (hyphen).`;
                }
            });

            // User didn't enter a new name
            if (newName === undefined) {
                return;
            }

            this.cabinetInteractor
                .renameElement(id, newName)
                .catch((err: { message: string; }) => {
                    window.showErrorMessage(err.message);
                });
        };
    }
}