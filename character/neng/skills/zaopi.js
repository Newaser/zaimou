import * as util from "../../../utils/util.js";
import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

export default new SkillData("zm_zaopi|凿辟", {
	description: "准备阶段，你可以失去1点体力并视为使用一张【瞒天过海】。此后你与其他角色的距离-1。",
	voices: [
		"凿山开险，破蜀建功！",
		"明战于剑阁，暗渡于阴平！",
	],
	skill: {
		trigger: { player: "phaseZhunbeiBegin" },
		filter(event, player, name, indexedData) {
			return player.hp > 0;
		},
		check(event, player, triggername, indexedData) {
			return player.hp > 1 &&
				player.getUseValue("dz_mantianguohai") > 0;
		},
		async content(event, trigger, player) {
			await player.loseHp();
			const mtgh = { name: "dz_mantianguohai", isCard: true };
			if (player.hasUseTarget(mtgh)) {
				await util.chooseToViewAs(player, {
					viewAs: mtgh,

					forced: true,
					prompt: "视为使用一张【瞒天过海】",

					filterCard: (card, player) => false,
					selectCard: -1,

					filterTarget(card, player, target) {
						return player.canUse("dz_mantianguohai", target);
					},
					selectTarget: [1, 2],

					ai1(card) {
						return -get.value(card);
					},
					ai2(target) {
						return get.effect(target, mtgh, player, player);
					},
				});
			}
			player.addMark("zm_zaopi_unlimited");
		},
		subSkill: {
			unlimited: {
				intro: {
					content: "你计算与其他角色的距离-#",
				},
				mod: {
					globalFrom(from, to, current) {
						return current - from.countMark("zm_zaopi_unlimited");
					},
				},
			},
		},
	},
});
