import { CharacterPackage } from "./import.js";
import { EXTENSION, QHLY_NAME, URL } from "./constants.js";
import { lib, game, ui, get, ai, _status } from "../../../noname.js";

/**
 * 检测千幻聆音、以及千幻聆音的预处理加载选项是否已开启，若未开启，则否开启
 * @returns {Promise<boolean>}
 */
function checkEnable() {
	return new Promise((resolve) => {
		game.getFileList?.("extension/", (dirs, files) => {
			for (const dir of dirs) {
				//@ts-expect-error `config` is in `lib`
				if (dir == QHLY_NAME && lib.config[`extension_${QHLY_NAME}_enable`]) {
					if (game.getExtensionConfig(QHLY_NAME, "qhly_funcLoadInPrecontent")) {
						resolve(true);
						return;
					}
					else if (confirm(`是否重启游戏以启用${EXTENSION.NAME}的千幻皮肤设置？`)) {
						game.saveExtensionConfig(QHLY_NAME, "qhly_funcLoadInPrecontent", true);
						game.reload();
					}
					break;
				}
			}
			resolve(false);
		});
	});
}

/**
 * 向千幻聆音里加载武将扩展包
 * @param {CharacterPackage} pkg
 */
export async function loadCharacterPackage(pkg) {
	if (!(await checkEnable())) return;
	const taici = {};
	for (const subpkg of pkg.subpkgs) {
		for (const character of subpkg.characters) {
			const voices = {};
			const info = character.info;
			if (info.dieVoice !== undefined) {
				voices.die = { content: info.dieVoice };
			}
			if (info.victoryVoice !== undefined) {
				voices.victory = { content: info.victoryVoice };
			}

			/** @type {string[]} */
			const allSKillIds = [];
			for (const skillId of info.basic.skills) {
				allSKillIds.push(skillId);
				const derivation = get.info(skillId).derivation;
				if (derivation) {
					if (typeof derivation === "string") {
						allSKillIds.push(derivation);
					} else {
						for (const i of derivation) {
							allSKillIds.push(i);
						}
					}
				}
			}
			for (const skillId of allSKillIds) {
				const textMap = game.parseSkillTextMap(skillId, character.id);
				const content = textMap.map(current => current.text).filter(Boolean).join("<br>");
				voices[skillId] = { content };
			}
			taici[character.id] = voices;
		}
	}



	lib["qhlypkg"] = lib["qhlypkg"] || [];
	lib["qhlypkg"].push({
		isExt: true,
		fromExt: true,
		/**
		 * @param {string} name
		 */
		filterCharacter(name) {
			return name.startsWith(`${EXTENSION.ID}_`);
		},
		/**
		 * @param {string} name
		 */
		characterTaici(name) {
			if (name != "spr_guanyu") {
				return taici[name];
			}
		},
		skin: {
			origin: URL.QHLY.CHARACTER_ASSETS,
		},
		audio: URL.QHLY.CHARACTER_ASSETS,
	});
}
