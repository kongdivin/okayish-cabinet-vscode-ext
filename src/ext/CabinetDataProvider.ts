import { Event, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri } from "vscode";
import CabinetRetriever from "../cabinet-core/CabinetRetriever";
import CabinetElement from "../cabinet-core/entities/CabinetElement";
import CabinetElementIcon from "./CabinetElementIcon";
import CabinetCommandFactory from "./commands/CabinetCommandFactory";

export default class CabinetDataProvider implements TreeDataProvider<string> {
    private cabinetRetriever: CabinetRetriever;
    private cmdFactory: CabinetCommandFactory;
    private event?: Event<string | undefined>;

    constructor(
        cabinetRetriever: CabinetRetriever,
        cmdFactory: CabinetCommandFactory,
        event?: Event<string | undefined>
    ) {
        this.cabinetRetriever = cabinetRetriever;
        this.cmdFactory = cmdFactory;
        this.event = event;
    }

    get onDidChangeTreeData(): Event<string | undefined> | undefined {
        return this.event;
    }

    async getTreeItem(elementId: string): Promise<TreeItem> {
        const element = await this.cabinetRetriever.retrieveElement(elementId);

        let collapsibleState =
            element.isSection()
                ? TreeItemCollapsibleState.Collapsed
                : TreeItemCollapsibleState.None;

        let item = new TreeItem(Uri.parse(element.id), collapsibleState);
        item.iconPath = CabinetElementIcon[element.type];
        item.command = this.cmdFactory.getViewCommand(element);
        item.contextValue = element.isSection() ? "section" : "page";
        return item;
    }

    async getChildren(elementId: string | undefined): Promise<string[]> {
        let children: CabinetElement[] = await this.cabinetRetriever.retrieveElements(elementId);
        return children
            .sort((a, b) => {
                if (a.type === b.type) {
                    return a.name.localeCompare(b.name);
                } else if (a.isSection()) {
                    return -1;
                } else {
                    return 1;
                }
            })
            .map(e => e.id);
    }
}