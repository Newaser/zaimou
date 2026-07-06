import * as util from "../../../utils/util.js";
import { URL } from "../../../utils/constants.js";
import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

export default new SkillData("zm_yanji|掩计", {
	description:
		"<b>蓄力技（0/1）</b>，当你使用牌时，你可以获得1点蓄力并令此牌无效。" +
		"当你使用基本牌或普通锦囊牌指定唯一目标后，你可以消耗任意点蓄力，令此牌多结算等量次。",
	voices: [
		"军屯得粮，足可应辎重之需。",
		"府库充盈，后备无忧。",
		"轻装急行，直取成都！",
		"乘敌不备，攻敌不及！",
		"急军速袭，破敌于须臾！",
	],
	skill: {
		chargeSkill: 1,
		init(player, skill) {
			player.setStorage("zm_yanji", 1);
			player.markSkill("zm_yanji");
		},
		mark: true,
		intro: {
			markcount(storage, player) {
				return `${player.countCharge()}/${player.getMaxCharge()}`;
			},
		},
		trigger: {},
		group: [
			"zm_yanji_defense",
			"zm_yanji_attack",
		],
		subSkill: {
			defense: {
				/** @type {import("../../../utils/type.ts").LogAudioFunc} */
				logAudio(event, player, name, indexedData, result) {
					const types = ["basic", "trick", "equip"];
					const idx = types.indexOf(get.type2(event.card)) + 1;
					return `${URL.SKILL_AUDIO}/zm_yanji${idx}.mp3`;
				},
				trigger: { player: "useCard" },
				filter(event, player, name, indexedData) {
					return player.countCharge(true) > 0;
				},
				check(event, player, triggername, indexedData) {
					// TODO
					return false;
				},
				async content(event, trigger, player) {
					player.addCharge();
					player.markSkill("zm_yanji");

					trigger.targets.length = 0;
					trigger.all_excluded = true;
				},
				prompt2(event, player) {
					return `获得1点蓄力并令${get.translation(event.card)}无效`;
				},
			},
			attack: {
				logAudio: util.logSkillAudio("zm_yanji", [4, 5]),
				trigger: { player: "useCardToPlayered" },
				filter(event, player, name, indexedData) {
					const cardType = get.type(event.card);
					return (cardType == "basic" || cardType == "trick") &&
						event.targets.length == 1 &&
						player.countCharge() > 0;
				},
				async cost(event, trigger, player) {
					const { bool, numbers } = await player.chooseNumbers({
						prompt: get.prompt("zm_yanji"),
						list: [{
							prompt: `失去任意点蓄力，令${get.translation(trigger.card)}多结算等量次`,
							min: 1,
							max: player.countCharge(),
						}],
						processAI(event) {
							// TODO
							return false;
						},
					}).forResult();
					if (bool) {
						event.result = {
							bool: true,
							cost_data: { num: numbers[0] },
						};
					}
				},
				async content(event, trigger, player) {
					/** @type {number} */
					const num = event.cost_data.num;

					player.removeCharge(num);
					player.markSkill("zm_yanji");

					// @ts-expect-error effectCount肯定存在
					trigger.getParent().effectCount += num;
				},
			},
		},
	},
});
