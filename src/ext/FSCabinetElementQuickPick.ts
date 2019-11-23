import { Disposable, window, Uri } from "vscode";
import CabinetElementQuickPickItem from "./CabinetElementQuickPickItem";
import CabinetElement from "../cabinet-core/entities/CabinetElement";
import FileSystemCabinetConfig from "./FSCabinetConfig";

export default class FSCabinetElementQuickPick {
    private config: FileSystemCabinetConfig;

    constructor(config: FileSystemCabinetConfig) {
        this.config = config;
    }

    public async pick(
        elements: CabinetElement[] | Thenable<CabinetElement[]>,
        options?: { placeholder?: string}
    ): Promise<CabinetElement> {
        
        const disposables: Disposable[] = [];
        let item: CabinetElement;

        try {
            return await new Promise(async (resolve) => {
                const quickPick = window.createQuickPick<CabinetElementQuickPickItem>();
                quickPick.placeholder = options?.placeholder;
                quickPick.ignoreFocusOut = true;
                const offset = Uri.parse(this.config.getCabinetUri()).toString().length;
                quickPick.items = (await elements)
                    .map(elm => {
                        const quickPickItem = new CabinetElementQuickPickItem(elm);
                        quickPickItem.description = `.${elm.id.slice(offset)}`;
                        return quickPickItem;
                    });

                disposables.push(quickPick);
                disposables.push(
                    quickPick.onDidChangeSelection(items => {
                        item = items[0].element;
                        quickPick.hide();
                    }),
                    quickPick.onDidHide(() => {
                        resolve(item);
                    })
                );

                quickPick.show();
            });
        } finally {
            disposables.forEach(d => d.dispose());
        }
    }
}