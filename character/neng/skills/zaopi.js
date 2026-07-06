import * as util from "../../../utils/util.js";
import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

export default new SkillData("zm_zaopi|凿辟", {
	description:
		"<b>限定技</b>，准备阶段，若你的蓄力点已满，你可以受到1点无来源伤害，" +
		"然后视为使用一张【瞒天过海】。此后你使用牌无距离限制。",
	voices: [
		"凿山开险，破蜀建功！",
		"明战于剑阁，暗渡于阴平！",
	],
	skill: {
		limited: true,
		skillAnimation: true,
		animationColor: "thunder",
		trigger: { player: "phaseZhunbeiBegin" },
		filter(event, player, name, indexedData) {
			return player.countCharge(true) == 0;
		},
		check(event, player) {
			// TODO
			return false;
		},
		async content(event, trigger, player) {
			player.awakenSkill(event.name);
			await player.damage({ nosource: true });
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
			player.addSkill("zm_zaopi_unlimited");
		},
		subSkill: {
			unlimited: {
				mark: true,
				intro: {
					content: "使用牌无距离限制",
				},
				mod: {
					targetInRange(card, player, target, result) {
						return true;
					},
				},
			},
		},
	},
});
