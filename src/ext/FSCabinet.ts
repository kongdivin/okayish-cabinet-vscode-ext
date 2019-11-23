import { Buffer } from "buffer";
import * as fs from "fs";
import * as grayMatter from 'gray-matter';
import * as path from 'path';
import { Event, EventEmitter, FileType, Uri, workspace } from "vscode";
import CabinetInteractor from "../cabinet-core/CabinetInteractor";
import CabinetElement from "../cabinet-core/entities/CabinetElement";
import Page from "../cabinet-core/entities/Page";
import Section from "../cabinet-core/entities/Section";
import SectionMeta from "../cabinet-core/entities/SectionMeta";
import FSCabinetConfig from "./FSCabinetConfig";
import UriProvider from "./UriProvider";

/**
 * An implementation of {@link CabinetInteractor} using local file system
 * with below characteristics:
 * 
 * - Use file URI as an elment id
 * - Section metadata is stored in `_meta.md` inside the section folder
 */
export default class FSCabinet implements CabinetInteractor {
    private static META_FILE_NAME = "_meta.md";
    private uriProvider: UriProvider;
    private config: FSCabinetConfig;
    private eventEmitter?: EventEmitter<string>;
    private fsWatchers = new Map<string, fs.FSWatcher>();

    constructor(uriProvider: UriProvider, config: FSCabinetConfig, eventEmitter?: EventEmitter<string>) {
        this.uriProvider = uriProvider;
        this.config = config;
        this.eventEmitter = eventEmitter;
        this.setupCabinetLocation();
        this.watch(this.config.getCabinetUri());
    }

    /**
     * Create the root folder if it doesn't exist.
     */
    private setupCabinetLocation() {
        if (fs.existsSync(this.config.getCabinetLocation())) {
            return;
        }

        fs.mkdirSync(this.config.getCabinetLocation(), { recursive: true });
    }

    public get event(): Event<string> | undefined {
        return this.eventEmitter?.event;
    }

    public async retrieveSection(id: string): Promise<Section> {
        const elm = this.retrieveElement(id);
        if (elm instanceof Section) {
            return elm as Section;
        } else {
            throw new Error("The element is not of type section.");
        }
    }

    public async retrieveSections(): Promise<Section[]> {
        const sections: Section[] = [];
        const rootSection = new Section(
            Uri.file(this.config.getCabinetLocation()).toString(),
            "Ok-ish Cabinet (root)",
            SectionMeta.NONE
        );

        const tmp: Section[] = [rootSection];
        while (tmp.length > 0) {
            const section = tmp.shift();
            if (section !== undefined) {
                sections.push(section);
                const childElements = await this.retrieveElements(section.id);
                tmp.unshift(
                    ...childElements
                        .filter(elm => elm instanceof Section)
                        .map(elm => elm as Section)
                );
            }
        }

        return sections;
    }

    public async retrieveElements(parentId: string | undefined): Promise<CabinetElement[]> {
        const uri = parentId !== undefined
            ? this.uriProvider.computeUri(parentId)
            : Uri.parse(this.config.getCabinetUri());

        const files = await workspace.fs.readDirectory(uri);
        const childElements: CabinetElement[] = [];

        for (let [fileName, type] of files) {
            if (fileName === FSCabinet.META_FILE_NAME) {
                continue;
            }

            const fileUri = this.createFileUri(uri, fileName);
            const fileUriString = fileUri.toString();

            switch (type) {
                case FileType.Directory:
                    const meta = await this.retrieveSectionMeta(fileUri);
                    childElements.push(new Section(fileUriString, fileName, meta));
                    this.watch(fileUriString);
                    break;

                case FileType.File:
                    childElements.push(new Page(fileUriString, fileName));
                    break;
            }

        }

        return childElements;
    }

    public async retrieveElement(id: string): Promise<CabinetElement> {
        const fileUri = this.uriProvider.computeUri(id);
        const fileName = path.basename(fileUri.fsPath);
        const fileStat = await workspace.fs.stat(fileUri);

        switch (fileStat.type) {
            case FileType.File:
                return new Page(id, fileName);

            case FileType.Directory:
                const meta = await this.retrieveSectionMeta(fileUri);
                return new Section(id, fileName, meta);

            default:
                throw new Error(`Invalid file type! Please remove ${id}`);
        }
    }

    private async retrieveSectionMeta(uri: Uri): Promise<SectionMeta> {
        try {
            const metaUri = this.createFileUri(uri, FSCabinet.META_FILE_NAME);
            const meta = await workspace.fs.readFile(metaUri)
                .then(meta => grayMatter(meta.toString()))
                .then(frontMatter => ({
                    description: frontMatter.content,
                    ...frontMatter.data
                }));

            return meta;
        } catch (error) {
            console.log(`[CAN_BE_IGNORED] Could not find metadata for ${uri.toString()}`, error);
            return SectionMeta.NONE;
        }
    }

    public async createSection(sectionName: string, parentId: string): Promise<void> {
        const sectionUri = this.createFileUri(this.uriProvider.computeUri(parentId), sectionName);
        await workspace.fs.createDirectory(sectionUri);

        const meta = `---
name: ${sectionName}
---

Enter description here (\`${FSCabinet.META_FILE_NAME}\`)
`;

        await workspace.fs.writeFile(
            this.createFileUri(sectionUri, FSCabinet.META_FILE_NAME), Buffer.from(meta)
        );
        this.notify(parentId);
    }

    public async createPage(pageName: string, parentId: string): Promise<void> {
        const parentUri = this.uriProvider.computeUri(parentId);
        const pageUri = this.createFileUri(parentUri, `${pageName}.md`);

        const pageContent = `<!-- ${pageUri.toString(true)} -->

# ${pageName}

Enjoy your write!`;

        await workspace.fs.writeFile(pageUri, Buffer.from(pageContent));
        this.notify(parentId);
    }

    public async renameElement(id: string, newName: string): Promise<void> {
        const uri = this.uriProvider.computeUri(id);
        const newUri = this.createFileUri(this.getParent(uri), `${newName}.md`);
        await workspace.fs.rename(uri, newUri, { overwrite: false });
        this.notifyParent(uri);
    }

    public async moveElement(id: string, destId: string): Promise<void> {
        const uri = this.uriProvider.computeUri(id);
        const element = await this.retrieveElement(id);
        const newUri = this.createFileUri(destId, element.name);
        await workspace.fs.rename(uri, newUri, { overwrite: false });
        this.notifyParent(uri);
        this.notify(destId);
    }

    public async deleteElement(id: string): Promise<void> {
        const uri = this.uriProvider.computeUri(id);
        await workspace.fs.delete(uri, { recursive: true, useTrash: true });
        this.notifyParent(uri);
    }

    private watch(id: string) {
        const uri = this.uriProvider.computeUri(id);
        let fsWatcher = this.fsWatchers.get(id);
        if (fsWatcher === undefined) {
            fsWatcher = fs.watch(uri.fsPath);
            this.fsWatchers.set(id, fsWatcher);
        }
        fsWatcher.removeAllListeners();
        fsWatcher.addListener("change", async (eventType: string, fileName: string) => {
            if (eventType === "rename") {
                this.notify(id);
            } else if (eventType === "change" && fileName.endsWith(".md")) {
                // TODO: Need to refresh the preview
                // May need to implement our own markdown preview
                // since the built-in one doesn't support this
            }
        });
    }

    private notifyParent(uri: Uri) {
        this.notify(this.getParent(uri));
    }

    private getParent(uri: Uri): Uri {
        return Uri.file(path.dirname(uri.fsPath));
    }

    private notify(uri: Uri | string) {
        const elementUri = uri instanceof Uri
            ? uri.toString()
            : uri;

        this.eventEmitter?.fire(
            this.isRoot(elementUri)
                ? undefined
                : elementUri
        );
    }

    private isRoot(uri: string): boolean {
        return this.config.getCabinetUri() === uri;
    }

    private createFileUri(directoryUri: Uri | string, fileName: string): Uri {
        const directoryPath = directoryUri instanceof Uri
            ? directoryUri.fsPath
            : Uri.parse(directoryUri).fsPath;

        return Uri.file(path.join(directoryPath, fileName));
    }
}