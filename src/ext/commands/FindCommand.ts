import { commands } from 'vscode';
import BaseCommand from './BaseCommand';
import Commands from "./Commands";
import FSCabinetConfig from '../FSCabinetConfig';

export default class FindCommand extends BaseCommand {
	public static COMMAND_NAME = "okayishCabinet.find";
	private config: FSCabinetConfig;

	constructor(
		config: FSCabinetConfig
	) {
		super();
		this.config = config;
	}

	getCommandName() {
		return FindCommand.COMMAND_NAME;
	}

	getCommandAction() {
		return () => {
			commands.executeCommand(
				Commands.FIND_IN_FILES,
				{
					query: "",
					filesToInclude: this.config.getCabinetLocation(),
					filesToExclude: `**/${this.config.getMetaFileName()}`
				}
			);
		}
	}

}