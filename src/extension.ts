// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import CabinetDataProvider from './ext/CabinetDataProvider';
import CreatePageCommand from './ext/commands/CreatePageCommand';
import CreateSectionCommand from './ext/commands/CreateSectionCommand';
import DeleteElementCommand from './ext/commands/DeleteElementCommand';
import MoveElementCommand from './ext/commands/MoveElementCommand';
import FSCabinet from './ext/FSCabinet';
import FSCabinetConfig from './ext/FSCabinetConfig';
import FSCabinetElementQuickPick from './ext/FSCabinetElementQuickPick';
import FSUriProvider from './ext/FSUriProvider';
import CabinetCommandFactory from './ext/commands/CabinetCommandFactory';
import PreviewPageCommand from './ext/commands/PreviewPageCommand';
import RefreshNotebookCommand from './ext/commands/RefreshNotebookCommand';
import RenameElementCommand from './ext/commands/RenameElementCommand';
import Commands from './ext/commands/Commands';
import OpenLocationCommand from './ext/commands/OpenLocationCommand';
import FindCommand from './ext/commands/FindCommand';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const uriProvider = new FSUriProvider();
	const config = new FSCabinetConfig(context);
	const fsEventEmitter = new vscode.EventEmitter<string | undefined>();
	const cabinet = new FSCabinet(uriProvider, config, fsEventEmitter);
	const cabinetElementQuickPick = new FSCabinetElementQuickPick(config);
	const cmdFactory = new CabinetCommandFactory(uriProvider);
	const cabinetDataProvider = new CabinetDataProvider(cabinet, cmdFactory, fsEventEmitter.event);
	const handleOnPageCreated = (pageId: string) =>
		vscode.commands.executeCommand(Commands.OPEN, uriProvider.computeUri(pageId));

	context.subscriptions.push(new RefreshNotebookCommand(fsEventEmitter).register());
	context.subscriptions.push(new FindCommand(config).register());
	context.subscriptions.push(new CreateSectionCommand(cabinet, config).register());
	context.subscriptions.push(new CreatePageCommand(cabinet, config, handleOnPageCreated).register());
	context.subscriptions.push(new PreviewPageCommand(uriProvider).register());
	context.subscriptions.push(new OpenLocationCommand(uriProvider).register());
	context.subscriptions.push(new RenameElementCommand(cabinet).register());
	context.subscriptions.push(new MoveElementCommand(cabinet, cabinetElementQuickPick).register());
	context.subscriptions.push(new DeleteElementCommand(cabinet).register());

	vscode.window.createTreeView("notebookInCabinet", { treeDataProvider: cabinetDataProvider });
	vscode.window.createTreeView("notebookInExplorer", { treeDataProvider: cabinetDataProvider });
}

// this method is called when your extension is deactivated
export function deactivate() { }
