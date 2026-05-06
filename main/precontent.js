import { EXTENSION, STYLE } from "../utils/constants.js";
import { lib, game, ui, get, ai, _status } from "../../../noname.js";
import characterPackage from "../character/index.js";

/** @type {importExtensionConfig['precontent']} */
export const precontent = (data) => {
	// add characters
	game.import("character", () => characterPackage.pack());
	lib.translate[`${EXTENSION.ID}_character_config`] = EXTENSION.NAME;

	characterPackage.setupRuntime1();
};
