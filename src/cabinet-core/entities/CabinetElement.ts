export abstract class CabinetElement {
    private _id: string;
    private _name: string;
    private _type: CabinetElement.Type;

    constructor(id: string, name: string, type: CabinetElement.Type) {
        this._name = name;
        this._id = id;
        this._type = type;
    }

    get name(): string {
        return this._name;
    }

    get id(): string {
        return this._id;
    }

    get type(): CabinetElement.Type {
        return this._type;
    }

    public isSection() {
        return this.type === CabinetElement.Type.Section;
    }

    public isPage() {
        return this.type === CabinetElement.Type.Page;
    }

}

export namespace CabinetElement {
    export enum Type {
        Section = "SECTION",
        Page = "PAGE"
    }
}

export default CabinetElement;