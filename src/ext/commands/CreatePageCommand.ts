import { window } from "vscode";
import CabinetInteractor from "../../cabinet-core/CabinetInteractor";
import FSCabinetConfig from "../FSCabinetConfig";
import BaseCommand from "./BaseCommand";

const pageNameRegExp = new RegExp('^[\\w\\s-]+$');

export default class CreatePageCommand extends BaseCommand {
    public static COMMAND_NAME = "okayishCabinet.createPage";
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
        return CreatePageCommand.COMMAND_NAME;
    }

    getCommandAction(): (destId: string) => Promise<void> {
        return async destId => {
            const dest = destId
                ? await this.cabinetInteractor.retrieveSection(destId)
                : await this.cabinetInteractor.retrieveSection(this.config.getCabinetUri());

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