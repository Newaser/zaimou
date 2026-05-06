import { EXTENSION } from "../utils/constants.js";
import { game } from "../../../noname.js";

/** @type {importExtensionConfig['config']} */
export const config = {
	imgStyle: {
		name: "插画样式",
		intro: "设置此扩展中武将插画的露头样式",
		init: "STANDARD",
		item: {
			STANDARD: "标准",
			MOBILE: "手杀露头",
		},
		/**
		 * @param {string} item
		 */
		onclick(item) {
			game.saveExtensionConfig(EXTENSION.NAME, "imgStyle", item);
			if (confirm("是否重启游戏以应用露头样式？")) game.reload();
		},
	},
	hr: {
		name: "<hr>",
		clear: true,
		nopointer: true,
	},
};
