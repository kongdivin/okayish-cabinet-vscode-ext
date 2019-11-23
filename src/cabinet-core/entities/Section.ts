import CabinetElement from "./CabinetElement";
import SectionMeta from "./SectionMeta";

export default class Section extends CabinetElement {
    private _meta: SectionMeta;

    constructor(id: string, name: string, meta: SectionMeta) {
        super(id, name, CabinetElement.Type.Section);
        this._meta = meta;
    }

    public get meta() {
        return this._meta;
    }
}