import { URL } from "../../../utils/constants.js";
import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

const descMap = {
	1: "每回合限一次，准备阶段或结束阶段，若你已受伤，你可以选择一项令一名其他角色执行：" +
		"摸X张牌，然后弃置一张牌；摸一张牌，然后弃置X张牌（X为你已损失的体力值）。",
	2: "准备阶段或结束阶段，若你已受伤，你可以选择一项令一名其他角色执行：" +
		"摸X张牌，然后弃置一张牌；摸一张牌，然后弃置X张牌（X为你已损失的体力值）。",
};

/**
 * 
 * @param {Player} player 
 * @returns {number}
 */
function getUsedTimes(player) {
	player.addTempSkill("zm_yinghun_used");
	return player.storage.zm_yinghun_used;
}
/**
 * 
 * @param {Player} player 
 */
function addUsedTimes(player) {
	player.storage.zm_yinghun_used++;
}

/**
 * 为一名角色升级〖英魂〗
 * @param {Player} player 
 * @returns {number|undefined} 升级后的等级
 */
export function upgradeYinghun(player) {
	if (!player.hasSkill("zm_yinghun"))
		return;
	let level = player.storage.zm_yinghun || 1;
	level = Math.min(level + 1, 2);
	player.storage.zm_yinghun = level;
	return level;
}

/**
 * 英魂选目标的ai
 * @param {Player} target 
 * @returns 
 */
export function yinghunCostAi(target) {
	const player = get.player();
	if (player.getDamagedHp() == 1 &&
		target.countCards("he") == 0)
		return 0;

	const att = get.attitude(player, target);
	if (att > 0) {
		return 10 + att;
	}
	if (player.getDamagedHp() == 1) {
		return -1;
	}
	return 1;
}

export default new SkillData("zm_yinghun|英魂", {
	description: `一级：${descMap[1]}<br>二级：${descMap[2]}`,
	dynamicDescription(player, desc) {
		const level = player.getStorage("zm_yinghun");
		return `<span class="greentext">（${get.cnNumber(level)}级）</span>` +
			`${descMap[level]}`;
	},
	voices: [
		"义定四野，武匡海内！",
		"歃血为盟，誓诛此国贼！",
		"不诛此贼三族，则吾死不瞑目！！",
		"伯符仲谋，当效吾之勇。",
		"尔等宵小，岂能当我江东雄兵！",
	],
	skill: {
		inherit: "gzyinghun",
		filter(event, player, name, target) {
			const
				level = player.getStorage("zm_yinghun"),
				limitMap = { 1: 1, 2: Infinity };
			return getUsedTimes(player) < limitMap[level] &&
				player.getDamagedHp() > 0;
		},
		async cost(event, trigger, player) {
			const
				x = get.player().getDamagedHp(),
				cnX = get.cnNumber(x, true),
				controls = [`摸${cnX}弃一`, `摸一弃${cnX}`],
				prompt2 = x == 1 ?
					"令一名其他角色摸一弃一" :
					`选择一项令一名其他角色执行：${controls.join("；")}`;
			/** @type {Result} */
			const result1 = await player.chooseTarget({
				prompt: get.prompt("zm_yinghun"),
				prompt2,
				filterTarget(card, player, target) {
					return player != target;
				},
				ai: yinghunCostAi,
			}).forResult();
			if (result1.bool) {
				let draw, discard;
				const to = result1.targets[0];
				if (x == 1) {
					draw = discard = 1;
				} else {
					/** @type {Result} */
					const result2 = await player.chooseControl({
						prompt: `英魂：选择一项令${get.translation(to)}执行`,
						controls,
						choice: get.attitude(player, to) > 0 ? 0 : 1,
					}).forResult();
					if (result2.control == controls[0]) {
						draw = x; discard = 1;
					} else {
						draw = 1; discard = x;
					}
				}
				event.result = {
					bool: true,
					targets: result1.targets,
					cost_data: { draw, discard },
				};
			}
		},
		async content(event, trigger, player) {
			addUsedTimes(player);
			const
				to = event.targets[0],
				{ draw, discard } = event.cost_data;
			await to.draw(draw);
			await to.chooseToDiscard({
				forced: true,
				selectCard: discard,
				position: "he",
			});
		},

		/** @type {import("../../../utils/type.ts").LogAudioFunc} */
		logAudio(event, player, name, indexedData, result) {
			const
				level = player.getStorage("zm_yinghun"),
				draw = result?.cost_data.draw,
				discard = result?.cost_data.discard;
			let idx;
			if (player.isDying()) {
				idx = 3;
			} else if (level == 1) {
				idx = draw >= discard ? 1 : 2;
			} else if (level == 2) {
				idx = draw >= discard ? 4 : 5;
			} else {
				return false;
			}
			return `${URL.SKILL_AUDIO}/zm_yinghun${idx}.mp3`;
		},
		init(player, skill) {
			player.setStorage(skill, 1);
		},
		trigger: {
			player: ["phaseZhunbeiBegin", "phaseJieshuBegin"],
		},
		subSkill: {
			used: {
				init(player, skill) {
					player.setStorage(skill, 0);
				},
				onremove: true,
			},
		},
	},
});
