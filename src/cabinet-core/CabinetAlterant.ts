export default interface CabinetAlterant {
    createSection(sectionName: string, destId?: string): Promise<void>;
    createPage(pageName: string, destId?: string): Promise<void>;
    renameElement(id: string, newName: string): Promise<void>;
    moveElement(id: string, destId: string): Promise<void>;
    deleteElement(id: string): Promise<void>;
}