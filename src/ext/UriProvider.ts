import { Uri } from "vscode";

export default interface UriProvider {
    computeUri(id: string): Uri;
}