import { QuickPickItem } from "vscode";
import CabinetElement from "../cabinet-core/entities/CabinetElement";

export default class CabinetElementQuickPickItem implements QuickPickItem {
    public element: CabinetElement;
    public description?: string;
    public detail?: string;
    public picked?: boolean;
    public alwaysShow?: boolean;

    constructor(element: CabinetElement) {
        this.element = element;
    }

    public get label() {
        return this.element.name;
    }
}