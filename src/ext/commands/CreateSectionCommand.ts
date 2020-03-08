import { window } from "vscode";
import CabinetInteractor from "../../cabinet-core/CabinetInteractor";
import BaseCommand from "./BaseCommand";
import FSCabinetConfig from "../FSCabinetConfig";

const sectionNameRegExp = new RegExp('^[\\w\\s-]+$');

export default class CreateSectionCommand extends BaseCommand {
    public static COMMAND_NAME = "okayishCabinet.createSection";
    private cabinetInteractor: CabinetInteractor;
    private config: FSCabinetConfig;

    constructor(
        cabinetInteractor: CabinetInteractor,
        config: FSCabinetConfig
    ) {
        super();
        this.cabinetInteractor = cabinetInteractor;
        this.config = config;
    }

    getCommandName(): string {
        return CreateSectionCommand.COMMAND_NAME;
    }

    getCommandAction(): (destId: string) => Promise<void> {
        return async destId => {
            const dest = destId
                ? await this.cabinetInteractor.retrieveSection(destId)
                : await this.cabinetInteractor.retrieveSection(this.config.getCabinetUri());

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