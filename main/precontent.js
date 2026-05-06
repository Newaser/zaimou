import { EXTENSION, STYLE } from "../utils/constants.js";
import { lib, game, ui, get, ai, _status } from "../../../noname.js";
import characterPackage from "../character/index.js";

/** @type {importExtensionConfig['precontent']} */
export const precontent = (data) => {
	// set up character package
	characterPackage.setupRuntime1();
};
