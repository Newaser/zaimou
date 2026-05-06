import { URL } from "./constants.js";
import { lib, game, ui, get, ai, _status } from "../../../noname.js";

/**
 * 解析索引
 * 若为数组，则随机选取其中一个索引。
 * 若为数组且isRange == true，则改为从范围内选择一个数
 * @param {number|number[]} idx - 索引
 * @param {boolean} isRange - 是否为索引范围，默认不为
 * @returns {number} 解析后的索引
 */
export function parseIndex(idx, isRange = false) {
	if (isRange) {
		if (!Array.isArray(idx) || idx.length != 2) {
			throw new Error("'idx' is suppused to be a range");
		}
		return get.rand(idx[0], idx[1]);
	}
	return Array.isArray(idx) ? idx.randomGet() : idx;
}

/**
 * 播放技能音频
 * @param {string} skillname - 技能名称
 * @param {number|number[]} idx - 音频索引。若为数组，则随机选取其中一个索引。
 * @param {boolean} isRange - 是否为索引范围，默认不为
 * @param {Player|undefined} texter - 顺带发出对应台词的角色，默认无
 */
export function playSkillAudio(skillname, idx, isRange = false, texter = undefined) {
	const parsedIdx = parseIndex(idx, isRange);
	const url = `${URL.SKILL_AUDIO}/${skillname}${parsedIdx}.mp3`;
	game.broadcastAll(() => {
		// @ts-expect-error lib.config运行时存在的
		if (lib.config.background_speak)
			game.playAudio({ path: url });
	});
	if (texter) {
		texter.say(getSkillVoice(skillname, parsedIdx));
	}
}

/**
 * 获取技能台词
 * @param {string} skillname - 技能名称
 * @param {number|number[]} idx - 台词索引
 * @returns {string}
 */
export function getSkillVoice(skillname, idx) {
	return get.translation(`#${URL.SKILL_AUDIO}/${skillname}${idx}`);
}

/**
 * 生成一个特定的SKill.logAudio函数
 * @param {string} skillname - 技能名称
 * @param {number|number[]} idx - 音频索引。若为数组，则随机选取其中一个索引。
 * @param {boolean} isRange - 是否为索引范围，默认不为
 * @returns {import("./type.ts").LogAudioFunc}
 */
export function logSkillAudio(skillname, idx, isRange = false) {
	const url = `${URL.SKILL_AUDIO}/${skillname}${parseIndex(idx, isRange)}.mp3`;
	/** @type {import("./type.ts").LogAudioFunc} */
	return function (event, player, name, indexedData, result) {
		return url;
	};
}

/**
 * 解析以 "(poptip)" 开头的字符串，提取 id 和 name
 * @param {string} str - 输入的字符串
 * @returns {{id:string,name:string}|null} 返回一个包含 id 和 name 的对象，或返回 null 如果格式不正确
 */
export function parsePoptip(str) {
	// 检查字符串是否以 "(poptip)" 开头，并匹配后面的 id 和 name
	const regex = /^\(poptip\)(\w+)\|(.+)$/;

	// 匹配字符串
	const match = str.match(regex);

	// 如果匹配成功，则返回一个包含 id 和 name 的对象
	if (match) {
		return {
			id: match[1],  // 第一个捕获组是 id
			name: match[2], // 第二个捕获组是 name
		};
	}

	// 如果字符串不符合要求，返回 null
	return null;
}

/**
 * 公开延时拼点的结果
 * @param {Player} player 拼点的发起者
 * @param {GameEvent} delayedCompare 延时拼点事件
 * @returns
 */
export function revealDelayedCompare(player, delayedCompare) {
	const next = game.createEvent("chooseToCompare", false);
	next.set("player", player);
	next.set("parentEvent", delayedCompare);
	next.setContent("chooseToCompareEffect");
	return next;
}

/**
 * 选择视为使用牌
 * @param {Player} player 执行者
 * @param {import("./type.ts").UtilChooseToViewAsParams} params 
 * @returns {GameEvent}
 */
export function chooseToViewAs(player, params) {
	const {
		forced,
		prompt,
		prompt2,
		filterCard,
		...restParams
	} = params;

	const backupId = crypto.randomUUID();
	lib.skill[backupId] = {
		popname: true,
		log: false,
		filterCard(card, player) {
			let ret = get.itemtype(card) == "card";
			if (filterCard) {
				const raw = (typeof filterCard == "function") ?
					filterCard(card, player) : filterCard;
				ret &&= raw;
			}
			return ret;
		},
		...restParams,
	};

	/** @type {GameEvent} */
	const next = player.chooseToUse(),
		str1 = prompt || "请选择你要视为使用的牌",
		str2 = prompt2 || "";
	next.set("openskilldialog", `###${str1}###${str2}`);
	next.set("norestore", true);
	next.set("_backupevent", backupId);
	next.set("custom", {
		add: {},
		replace: { window() { } },
	});
	next.backup(backupId);
	next.forced = forced || false;
	next.then(() => {
		delete lib.skill[backupId];
	});

	return next;
}
