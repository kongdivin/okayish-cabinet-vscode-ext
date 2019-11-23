import { window } from "vscode";
import CabinetInteractor from "../../cabinet-core/CabinetInteractor";
import Section from "../../cabinet-core/entities/Section";
import FSCabinetElementQuickPick from "../FSCabinetElementQuickPick";
import BaseCommand from "./BaseCommand";

export default class MoveElementCommand extends BaseCommand {
    public static COMMAND_NAME = "okayishCabinet.moveElement";
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
        return MoveElementCommand.COMMAND_NAME;
    }

    getCommandAction(): (id: string) => Promise<void> {
        return async id => {
            const dest = await this.cabinetElementQuickPick.pick(
                this.cabinetInteractor.retrieveSections(),
                { placeholder: "Select the destination" }
            );

            // User didn't select any
            if (dest === undefined || !(dest instanceof Section)) {
                return;
            }

            this.cabinetInteractor
                .moveElement(id, dest.id)
                .catch((err: { message: string; }) => {
                    window.showErrorMessage(err.message);
                });
        };
    }
}