import UriProvider from "./UriProvider";
import { Uri } from "vscode";

export default class FSUriProvider implements UriProvider {
    public computeUri(id: string): Uri {
        return Uri.parse(id);
    }
}