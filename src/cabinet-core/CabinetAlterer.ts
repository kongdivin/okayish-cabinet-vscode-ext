export default interface CabinetAlterer {
    createSection(sectionName: string, destId?: string): Promise<void>;
    createPage(pageName: string, destId?: string): Promise<string>;
    renameElement(id: string, newName: string): Promise<void>;
    moveElement(id: string, destId: string): Promise<void>;
    deleteElement(id: string): Promise<void>;
}