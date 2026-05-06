import { EXTENSION } from "./utils/constants.js";
import { config } from "./main/config.js";
import { packageInfo } from "./main/package-info.js";
import { content } from "./main/content.js";
import { precontent } from "./main/precontent.js";

/** @type {importExtensionConfig} */
const extension = {
	name: EXTENSION.NAME,
	editable: false,
	config,
	package: packageInfo,
	content,
	precontent,
};

export const type = "extension";
export default extension;
