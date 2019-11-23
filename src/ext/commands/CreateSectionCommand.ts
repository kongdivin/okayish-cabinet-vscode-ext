import { window } from "vscode";
import CabinetInteractor from "../../cabinet-core/CabinetInteractor";
import Section from "../../cabinet-core/entities/Section";
import FSCabinetElementQuickPick from "../FSCabinetElementQuickPick";
import BaseCommand from "./BaseCommand";

const sectionNameRegExp = new RegExp('^[\\w\\s-]+$');

export default class CreateSectionCommand extends BaseCommand {
    public static COMMAND_NAME = "okayishCabinet.createSection";
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
        return CreateSectionCommand.COMMAND_NAME;
    }

    getCommandAction(): () => Promise<void> {
        return async () => {
            const dest = await this.cabinetElementQuickPick.pick(
                this.cabinetInteractor.retrieveSections(),
                { placeholder: "Select where to put the new section" }
            );

            // User didn't select any
            if (dest === undefined || !(dest instanceof Section)) {
                return;
            }

            const sectionName = await window.showInputBox({
                prompt: `Parent: ${dest.name}. Be creative! 😉`,
                placeHolder: "Give this section a name",
                ignoreFocusOut: true,
                validateInput: (value: string): string | undefined => {
                    if (sectionNameRegExp.test(value.trim())) {
                        return;
                    }

                    return `Sorry, this is not a valid name. 
                    Use only a-z, A-Z, 0-9, including whitespace, _ (underscore) and - (hyphen).`;
                }
            });

            // User didn't enter a name
            if (sectionName === undefined) {
                return;
            }

            this.cabinetInteractor
                .createSection(sectionName.trim(), dest.id)
                .catch((err: { message: string; }) => {
                    window.showErrorMessage(err.message);
                });

        };
    }
}