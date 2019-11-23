import CabinetElement from "./entities/CabinetElement";
import Section from "./entities/Section";

export default interface CabinetRetriever {
    retrieveSection(id: string): Promise<Section>;
    retrieveSections(): Promise<Section[]>;
    retrieveElement(id: string): Promise<CabinetElement>;
    retrieveElements(parentId?: string): Promise<CabinetElement[]>;
}