import { lib, game, ui, get, ai, _status } from "../../../noname.js";
import characterPackage from "../character/index.js";

/** @type {importExtensionConfig['content']} */
export const content = (config, pack) => {
	characterPackage.setupRuntime2();
};
