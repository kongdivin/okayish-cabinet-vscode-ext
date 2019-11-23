import { window } from "vscode";
import CabinetInteractor from "../../cabinet-core/CabinetInteractor";
import Section from "../../cabinet-core/entities/Section";
import FSCabinetElementQuickPick from "../FSCabinetElementQuickPick";
import BaseCommand from "./BaseCommand";

const pageNameRegExp = new RegExp('^[\\w\\s-]+$');

export default class CreatePageCommand extends BaseCommand {
    public static COMMAND_NAME = "okayishCabinet.createPage";
    private cabinetInteractor: CabinetInteractor;
    private cabinetElementQuickPick: FSCabinetElementQuickPick;

    constructor(
        cabinetInteractor: CabinetInteractor,
        cabinetElementQuickPick: FSCabinetElementQuickPick
    ) {
        super();
        this.cabinetInteractor = cabinetInteractor;
        this.cabinetElementQuickPick = cabinetElementQuickPick;
    }

    getCommandName(): string {
        return CreatePageCommand.COMMAND_NAME;
    }

    getCommandAction(): () => Promise<void> {
        return async () => {
            const dest = await this.cabinetElementQuickPick.pick(
                this.cabinetInteractor.retrieveSections(),
                { placeholder: "Select where to put the new page" }
            );

            // User didn't select any
            if (dest === undefined || !(dest instanceof Section)) {
                return;
            }

            const pageName = await window.showInputBox({
                prompt: `Parent: ${dest?.name}. Be creative! 😉`,
                placeHolder: "Give this page a name",
                ignoreFocusOut: true,
                validateInput: (value: string): string | undefined => {
                    if (pageNameRegExp.test(value.trim())) {
                        return;
                    }

                    return `Sorry, this is not a valid name. 
                    Use only a-z, A-Z, 0-9, including whitespace, _ (underscore) and - (hyphen).`;
                }
            });

            // User didn't enter a name
            if (pageName === undefined) {
                return;
            }

            this.cabinetInteractor
                .createPage(pageName.trim(), dest.id)
                .catch((err: { message: string; }) => {
                    window.showErrorMessage(err.message);
                });
        };
    }
}