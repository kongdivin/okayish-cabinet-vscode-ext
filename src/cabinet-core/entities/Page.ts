import CabinetElement from "./CabinetElement";

export default class Page extends CabinetElement {
    constructor(id: string, name: string) {
        super(id, name, CabinetElement.Type.Page);
    }
}
