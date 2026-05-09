import * as util from "../utils/util.js";
import { EXTENSION, URL, STYLE } from "./constants.js";
import { lib, game, ui, get, ai, _status } from "../../../noname.js";
import { Character } from "../../../noname/library/element/index.js";

// 适配的扩展
import * as qhly from "../utils/qhly.js";

/**
 * @typedef {import("./type.ts").CharacterInfo} CharacterInfo
 * @typedef {import("./type.ts").SkillInfo} SkillInfo
 */

/** **抽象数据类**
 * 
 * 包含此类型数据的id、名称、信息等。
 * @template T
 */
class AbstractData {
	#id; #name; #info;
	/**
	 * 数据ID
	 * @returns {string}
	 */
	get id() { return this.#id; }
	/**
	 * 译名
	 * @returns {string|undefined}
	 */
	get name() { return this.#name; }
	/**
	 * 数据信息
	 * @returns {T}
	 */
	get info() { return this.#info; }

	/**
	 * @param {string} formattedName
	 * @param {T} data
	 */
	constructor(formattedName, data) {
		const [id, name] = formattedName.split("|");
		this.#id = id;
		this.#name = name || undefined;
		this.#info = data;
	}

	/** 
	 * 获取此类型数据的相关翻译文本
	 * @returns {Record<string,string>} 
	 */
	getTranslates() {
		throw new Error("Abstract method");
	}
}

/** 武将数据
 * @extends {AbstractData<CharacterInfo>}
 */
export class CharacterData extends AbstractData {
	/**
	 * 创建一个武将数据对象，用于存储武将的id、名称、信息等。
	 * @param {string} formattedName 格式化的武将名称，格式为 `id|译名`
	 * @param {CharacterInfo} data 武将数据
	 */
	constructor(formattedName, data) {
		super(formattedName, data);
	}

	/**
	 * 将技能语音重定向的信息转化为其名字，为其中第一个技能名
	 * @param {string} redirectInfo 技能语音重定向的信息
	 * @returns {string} 重定向的名字
	 */
	static redirectInfo2Name(redirectInfo) {
		return redirectInfo.split("|")[0].split(":").join("_");
	}

	/** 
	 * 获取武将相关的翻译文本
	 * @returns {Record<string,string>} 
	 */
	getTranslates() {
		/** @type {Record<string,string>} */
		const ret = {};

		if (this.name !== undefined) {
			ret[this.id] = this.name;
		}

		if (this.info.dieVoice !== undefined) {
			ret[`#ext:${EXTENSION.NAME}/audio/die/${this.id}:die`] =
				this.info.dieVoice;
			ret[`#${this.id}:die`] = this.info.dieVoice;
		}

		if (this.info.audioRedirect !== undefined) {
			for (const [redirectInfo, voices] of Object.entries(this.info.audioRedirect)) {
				const redirectName = CharacterData.redirectInfo2Name(redirectInfo);
				for (let i = 0; i < voices.length; i++) {
					const key =
						`#ext:${EXTENSION.NAME}/audio/skill/${redirectName}__${this.id}${i + 1}`;
					ret[key] = voices[i];
				}
			}
		}

		Object.assign(ret, this.info.texts || {});

		return ret;
	}

	/**
	 * 将武将替身注册到游戏内
	 */
	registerSubstitutes() {
		const substitutes = this.info.inPackSubstitutes;
		if (substitutes) {
			lib.characterSubstitute[this.id] =
				substitutes.map(s => [s, [`die:${URL.DIE_AUDIO}/${s}.mp3`]]);
		}
	}

	/**
	 * 绑定至同名武将替换序列
	 */
	registerCharacterReplace() {
		// //@ts-expect-error 可以这样的
		const replaces = lib.characterReplace;
		const trueId = this.id.split("_")[1];
		replaces[trueId] = replaces[trueId] || [];
		replaces[trueId].push(this.id);
	}

	/**
	 * 将武将的评级、稀有度注册到游戏内（须运行时2操作）
	 */
	registerRank() {
		const rank = /** @type {any} */ (lib).rank;
		if (rank) {
			if (this.info.rank) {
				rank[this.info.rank].push(this.id);
			}
			if (rank.rarity && this.info.rarity && this.info.rarity != "common") {
				rank.rarity[this.info.rarity].push(this.id);
			}
		}
	}

	/**
	 * 将武将的技能语音重定向注册到游戏内（须运行时2操作）
	 */
	registerAudioRedirects() {
		if (this.info.audioRedirect !== undefined) {
			for (const redirectInfo in this.info.audioRedirect) {
				const redirectName = CharacterData.redirectInfo2Name(redirectInfo);
				for (const skillId of redirectInfo.split("|")) {
					const parts = skillId.split(":");
					if (parts.length == 1) {
						if (!lib.skill[skillId].audioname2) {
							lib.skill[skillId].audioname2 = {};
						}
						lib.skill[skillId].audioname2[this.id] = `${redirectName}__${this.id}`;
					} else {
						const [id1, id2] = parts;
						const subSkill = lib.skill[id1]?.subSkill?.[id2];
						if (subSkill) {
							if (!subSkill.audioname2) {
								subSkill.audioname2 = {};
							}
							subSkill.audioname2[this.id] = `${redirectName}__${this.id}`;
						}
					}
				}
			}
		}
	}
}

/** 技能数据
 * @extends {AbstractData<SkillInfo>}
 */
export class SkillData extends AbstractData {
	/**
	 * 创建一个技能数据对象，用于存储技能的id、名称、信息等。
	 * @param {string} formattedName 格式化的技能名称，格式为 `id|译名`
	 * @param {SkillInfo} data 技能数据
	 */
	constructor(formattedName, data) {
		super(formattedName, data);

		if (this.info.disableAutoAudio !== true && this.info.voices?.length) {
			this.info.skill.audio =
				`${URL.SKILL_AUDIO}:${this.info.voices.length}`;
		}
	}

	/** 
	 * 获取技能相关的翻译文本
	 * @returns {Record<string,string>} 
	 */
	getTranslates() {
		/** @type {Record<string,string>} */
		const ret = {};

		if (this.name !== undefined) {
			ret[this.id] = this.name;
		}

		if (this.info.description !== undefined) {
			ret[`${this.id}_info`] = this.info.description;
		}

		if (this.info.disableAutoAudio !== true && this.info.voices?.length) {
			for (let i = 0; i < this.info.voices.length; i++) {
				const voice = this.info.voices[i];
				ret[`#${URL.SKILL_AUDIO}/${this.id}${i + 1}`] = voice;
			}
		}

		Object.assign(ret, this.info.texts || {});

		return ret;
	}

	/** 
	 * 获取技能描述的动态翻译
	 * @returns {((player: Player) => string) | void} 
	 */
	getDynamicTranslate() {
		const
			desc = this.info.description,
			defaultDesc = `${this.id}_info`,
			dynamicDesc = this.info.dynamicDescription;
		if (dynamicDesc) {
			return (player) =>
				dynamicDesc(player, desc || defaultDesc) || desc || defaultDesc;
		}
	}
}

/** **武将子包**
 * 
 * 一个扩展中可能包含多个武将包，每个包即一个子包，每个子包可包含多个武将数据。
 */
export class CharacterSubackage {
	/**
	 * 创建一个武将子包，可包含多个武将、武将技能等元素
	 * @param {string} formattedName 武将子包的名称，格式为 `id|译名`
	 */
	constructor(formattedName) {
		const [id, name] = formattedName.split("|");

		/** 
		 * 子包id
		 * @type {string} 
		 * */
		this.id = id;

		/** 
		 * 子包名
		 * @type {string|undefined} 
		 */
		this.name = name || undefined;

		/** 
		 * 武将
		 * @type {CharacterData[]}
		 */
		this.characters = [];

		/** 
		 * 武将技能
		 * @type {SkillData[]}
		 */
		this.skills = [];
	}

	/**
	 * 添加一个武将
	 * @param {string} formattedName 格式化的武将名称，格式为 `id|译名`
	 * @param {CharacterInfo} data 武将数据
	 * @returns {CharacterSubackage} 返回自身。支持链式添加元素
	 */
	addCharacter(formattedName, data) {
		const character = new CharacterData(formattedName, data);
		this.characters.push(character);
		return this;
	}

	/**
	 * 添加一个武将技能
	 * @param {SkillData} skill 
	 * @returns {CharacterSubackage} 返回自身。支持链式添加元素
	 */
	addSkill(skill) {
		this.skills.push(skill);
		return this;
	}

	/**
	 * 一次性添加多个武将技能
	 * @param {SkillData[]} skills 
	 * @returns {CharacterSubackage} 返回自身。支持链式添加元素
	 */
	addSkills(skills) {
		skills.forEach(skill => this.addSkill(skill));
		return this;
	}

	/** 
	 * 获取所有与本包相关的翻译文本
	 * @returns {Record<string,string>}
	 */
	getTranslates() {
		/** @type {Record<string,string>} */
		const ret = {};

		if (this.name !== undefined) {
			ret[this.id] = this.name;
		}

		for (const character of this.characters) {
			Object.assign(ret, character.getTranslates());
		}

		for (const skill of this.skills) {
			Object.assign(ret, skill.getTranslates());
		}

		return ret;
	}

	/**
	 * 运行时初始化，在扩展包的 `precontent` 中运行
	 */
	setupRuntime1() {
		this.characters.forEach(character => {
			character.registerSubstitutes();
			character.info.runtime1?.(character.info);
		});
		this.skills.forEach(skill => {
			skill.info.runtime1?.(skill.info);
		});
	}

	/**
	 * 运行时初始化，在扩展包的 `content` 中运行
	 */
	setupRuntime2() {
		this.characters.forEach(character => {
			if (!character.info.disableAutoReplace) {
				character.registerCharacterReplace();
			}
			character.registerRank();
			character.registerAudioRedirects();
			character.info.runtime2?.(character.info);
		});
		this.skills.forEach(skill => {
			skill.info.runtime2?.(skill.info);
		});
	}
}

/** **武将包**
 * 
 * 所有武将子包的集合
 */
export class CharacterPackage {
	/**
	 * 创建一个武将包，用于整合多个武将子包
	 */
	constructor() {
		/**
		 * 子包集合
		 * @type {CharacterSubackage[]}
		 */
		this.subpkgs = [];
	}

	/**
	 * 添加一个子包
	 * @param {CharacterSubackage} subpkg 
	 */
	addSubackage(subpkg) {
		this.subpkgs.push(subpkg);
	}

	/**
	 * 添加多个子包
	 * @param {CharacterSubackage[]} subpkgs
	 */
	addSubpackages(subpkgs) {
		subpkgs.forEach(subpkg => this.addSubackage(subpkg));
	}

	/**
	 * 武将包内的所有内容打包成 `importCharacterConfig` 的形式
	 * @returns {importCharacterConfig}
	 */
	pack() {
		const
			/** @type {importCharacterConfig['character'] & Record<string, Character>} */
			characterBasic = {},

			/** @type {importCharacterConfig['characterIntro']} */
			characterIntro = {},

			/** @type {importCharacterConfig['characterTitle']} */
			characterTitle = {},

			/** @type {importCharacterConfig['characterSort']} */
			characterSort = { [EXTENSION.ID]: {} },

			/** @type {importCharacterConfig['skill']} */
			skills = {},

			/** @type {importCharacterConfig['translate']} */
			translate = {},

			/** @type {importCharacterConfig['dynamicTranslate']} */
			dynamicTranslate = {},

			/** @type {SkillData[]} */
			additionalSkills = [];

		for (const pkg of this.subpkgs) {
			// add characters
			const sort = [];
			for (const character of pkg.characters) {
				const info = character.info;
				characterBasic[character.id] = info.basic;
				const imgStyle =
					game.getExtensionConfig(EXTENSION.NAME, "imgStyle") ||
					"STANDARD";
				characterBasic[character.id].img =
					`${URL.CHARACTER_IMAGE[imgStyle]}/${character.id}.jpg`;
				characterBasic[character.id].dieAudios =
					[`${URL.DIE_AUDIO}/${character.id}.mp3`];
				if (info.intro !== undefined) {
					characterIntro[character.id] = info.intro;
				}
				if (info.title !== undefined) {
					characterTitle[character.id] = info.title;
				}
				sort.push(character.id);
				if (info.audioRedirect !== undefined) {
					for (const redirectInfo in info.audioRedirect) {
						const redirectName = CharacterData.redirectInfo2Name(redirectInfo);
						additionalSkills.push(new SkillData(`${redirectName}__${character.id}`, {
							voices: info.audioRedirect[redirectInfo],
							skill: {},
						}));
					}
				}
				if (info.victoryVoice !== undefined) {
					additionalSkills.push(new SkillData(`victory__${character.id}`, {
						disableAutoAudio: true,
						skill: {
							audio: `${URL.VICTORY_AUDIO}/${character.id}/victory.mp3`,
						},
					}));
					translate[`#${URL.VICTORY_AUDIO}/${character.id}/victory`] = info.victoryVoice;
				}
			}
			characterSort[EXTENSION.ID][pkg.id] = sort;

			// add skills
			for (const skill of pkg.skills.concat(additionalSkills)) {
				skills[skill.id] = skill.info.skill;
				const dynamicDesc = skill.getDynamicTranslate();
				if (dynamicDesc !== undefined) {
					dynamicTranslate[skill.id] = dynamicDesc;
				}
				if (skill.info.texts) {
					for (const [k, v] of Object.entries(skill.info.texts)) {
						const parse = util.parsePoptip(k);
						if (parse) {
							lib.poptip.add({
								type: "rule",
								id: parse.id,
								name: parse.name,
								info: v,
							});
						}
					}
				}
			}

			// add translates
			Object.assign(translate, pkg.getTranslates());
		}

		return {
			name: EXTENSION.ID,
			character: characterBasic,
			characterIntro,
			characterTitle,
			characterSort,
			skill: skills,
			translate,
			dynamicTranslate,
		};
	}

	/**
	 * 运行时初始化，在扩展包的 `precontent` 中运行
	 */
	setupRuntime1() {
		// set name prefix style
		if (STYLE.EXTENSION_NAME_PREFIX)
			lib.namePrefix.set(
				EXTENSION.NAME_PREFIX,
				STYLE.EXTENSION_NAME_PREFIX,
			);

		// import package
		game.import("character", () => this.pack());

		// bind name with id
		lib.translate[`${EXTENSION.ID}_character_config`] = EXTENSION.NAME;

		this.subpkgs.forEach(pkg => {
			pkg.setupRuntime1();
		});
	}

	/**
	 * 运行时初始化，在扩展包的 `content` 中运行
	 */
	setupRuntime2() {
		this.subpkgs.forEach(pkg => pkg.setupRuntime2());
		qhly.loadCharacterPackage(this);
	}
}
