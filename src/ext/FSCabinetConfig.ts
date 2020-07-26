import * as path from 'path';
import { ExtensionContext, workspace, Uri } from "vscode";

export default class FSCabinetConfig {
    public static readonly CABINET_LOCATION_SETTING_KEY = "okayishCabinet.cabinetLocation";
    public static readonly CABINET_DEFAULT_FOLDER_NAME = "okayish-cabinet";
    private ctx: ExtensionContext;
    private cabinetLocation: string;

    constructor(ctx: ExtensionContext) {
        this.ctx = ctx;
        this.cabinetLocation = this.computeCabinetLocation();
    }

    private computeCabinetLocation() {
        const cabinetLocation: string | undefined =
            workspace
                .getConfiguration()
                .get(FSCabinetConfig.CABINET_LOCATION_SETTING_KEY);

        return cabinetLocation !== undefined && cabinetLocation.length !== 0
            ? cabinetLocation
            : path.join(this.ctx.globalStoragePath, FSCabinetConfig.CABINET_DEFAULT_FOLDER_NAME);
    }

    public getCabinetLocation() {
        return this.cabinetLocation;
    }

    public getCabinetUri() {
        return Uri.file(this.cabinetLocation).toString();
    }

    public getMetaFileName() {
        return "_meta.md"
    }
}