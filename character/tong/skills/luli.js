import * as util from "../../../utils/util.js";
import { URL } from "../../../utils/constants.js";
import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

/**
 * 判断卡牌是否为默认目标牌
 * @param {Card | VCard | CardBaseUIData} card
 * @returns {boolean}
 */
function isTargetFixed(card) {
	/** @type {Skill} */
	const info = get.info(card);
	return !info.notarget && info.selectTarget === -1;
}

/**
 * 是否可以戮力
 * @param {Player} from 戮力发起者
 * @param {Player} to 被戮力角色
 * @param {GameEvent} event 使用牌事件
 * @returns {boolean}
 */
function luliable(from, to, event) {
	if (from == to || !to.hasSkill("zm_luli"))
		return false;
	if (isTargetFixed(event.card)) {
		return to.hasUseTarget(event.card, false, false);
	}
	return event.targets.length > 0 &&
		event.targets.every(i => to.canUse(event.card, i, false, false));
}

export default new SkillData("zm_luli|戮力", {
	description:
		"出牌阶段限一次，当你使用【杀】或普通锦囊牌结算结束后，" +
		"你可以令一名其他“戮力”角色视为使用此牌（无距离与次数限制）。" +
		"若此牌非固定目标牌，则须与原本牌指定相同目标。",
	voices: [
		"有胆气者，随某前去一战！",
		"还敢逞凶，太史子义在此！",
	],
	texts: {
		"(poptip)zm_luli_state|戮力":
			`一名角色进入“戮力”状态后，其获得技能${get.poptip("zm_luli")}。`,
	},
	skill: {
		/** @type {import("../../../utils/type.ts").LogAudioFunc} */
		logAudio(event, player, name, indexedData, result) {
			//@ts-expect-error result is defined
			const to = result.targets[0];
			/**
			 * @param {Player} i 
			 * @returns {boolean}
			 */
			const isTaishici = i => {
				console.log(`names: ${[i.name, i.name1, i.name2].join(", ")}`);
				return [i.name, i.name1, i.name2]
					.some(j => j?.endsWith("taishici"));
			};

			if (isTaishici(player)) {
				return `${URL.SKILL_AUDIO}/zm_luli1.mp3`;
			} else if (isTaishici(to)) {
				util.playSkillAudio("zm_luli", 2, false, to);
			}
			return false;
		},
		mark: true,
		intro: { content: "该角色正处于戮力状态" },
		trigger: {
			player: "useCardAfter",
		},
		filter(event, player, name, target) {
			return !player.hasSkill("zm_luli_used") &&
				player.isPhaseUsing() &&
				(event.card.name == "sha" || get.type(event.card) == "trick") &&
				game.hasPlayer(i => luliable(player, i, event));
		},
		async cost(event, trigger, player) {
			const luliCard = trigger.card;
			let tarsStr = "";
			if (!isTargetFixed(luliCard)) {
				tarsStr += "对";
				tarsStr +=
					trigger.targets.map(i => get.translation(i)).join("、");
			}

			event.result = await player.chooseTarget({
				prompt: get.prompt("zm_luli"),
				prompt2:
					`令一名其他“戮力”角色视为${tarsStr}使用一张 ` +
					`<span style="color: cyan">${get.translation(luliCard.name)}</span>`,
				filterTarget(card, player, target) {
					return luliable(player, target, trigger);
				},
				ai(target) {
					const vcard = { name: luliCard.name, isCard: true };
					if (isTargetFixed(luliCard)) {
						return target.getUseValue(vcard, false, false);
					}
					return trigger.targets.reduce((acc, cur) => {
						return acc + get.effect(cur, vcard, target, player);
					}, 0);
				},
			}).forResult();
		},
		async content(event, trigger, player) {
			player.addTempSkill("zm_luli_used");
			const
				to = event.targets[0],
				card = trigger.card,
				vcard = { name: card.name, isCard: true };

			if (isTargetFixed(card)) {
				await to.chooseUseTarget({
					//@ts-expect-error 可以这样
					card: vcard,
					forced: true,
				});
			} else {
				await to.useCard({
					//@ts-expect-error 可以这样
					card: vcard,
					targets: trigger.targets,
				});
			}
		},
		subSkill: { used: {} },
	},
});

export const luli_test1 = new SkillData("zm_luli_test1|加戮", {
	description: `为一名角色添加技能${get.poptip("zm_luli")}。`,
	skill: {
		enable: "phaseUse",
		filterTarget(card, player, target) {
			return !target.hasSkill("zm_luli");
		},
		async content(event, trigger, player) {
			event.target.addSkill("zm_luli");
		},
	},
});

export const luli_test2 = new SkillData("zm_luli_test2|删戮", {
	description: `为一名角色删除技能${get.poptip("zm_luli")}。`,
	skill: {
		enable: "phaseUse",
		filterTarget(card, player, target) {
			return target.hasSkill("zm_luli");
		},
		async content(event, trigger, player) {
			event.target.removeSkill("zm_luli");
		},
	},
});
