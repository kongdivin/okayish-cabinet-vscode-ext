import { Command, Uri } from "vscode";
import Commands from "./Commands";
import CabinetElement from "../../cabinet-core/entities/CabinetElement";
import UriProvider from "../UriProvider";

export default class CabinetCommandFactory {
    private uriProvider: UriProvider;

    constructor(uriProvider: UriProvider) {
        this.uriProvider = uriProvider;
    }

    public getViewCommand(element: CabinetElement): Command | undefined {
        switch (element.type) {
            case CabinetElement.Type.Section:
                return undefined;
            case CabinetElement.Type.Page:
                return {
                    command: Commands.OPEN,
                    title: `View ${element.name}`,
                    arguments: [this.uriProvider.computeUri(element.id)]
                };
            default:
                return undefined;
        }
    }
}