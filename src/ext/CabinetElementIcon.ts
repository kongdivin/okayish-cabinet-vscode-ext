import { ThemeIcon } from "vscode";
import CabinetElement from "../cabinet-core/entities/CabinetElement";

export default {
    [CabinetElement.Type.Section]: ThemeIcon.Folder,
    [CabinetElement.Type.Page]: ThemeIcon.File
};