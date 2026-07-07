import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

/** @type {CardBaseUIData} */
const mtgh = {
	name: "dz_mantianguohai",
	isCard: true,
	storage: { zm_zaopi: true },
};

export default new SkillData("zm_zaopi|凿辟", {
	description:
		"每回合限一次，你可以失去1点体力并视为使用一张" +
		`${get.poptip("dz_mantianguohai")}。此后你与其他角色距离-1。`,
	voices: [
		"凿山开险，破蜀建功！",
		"明战于剑阁，暗渡于阴平！",
	],
	skill: {
		enable: "chooseToUse",
		usable: 1,
		viewAs: mtgh,

		filterCard: (card, player) => false,
		selectCard: -1,

		async precontent(event, trigger, player) {
			await player.loseHp();
		},
		onuse(result, player) {
			player
				.when("useCardAfter")
				.filter((event, player, name, indexedData) => {
					return event.card.storage?.zm_zaopi === true;
				})
				.step(async (event, trigger, player) => {
					player.addMark("zm_zaopi_distance");
				});
		},
		group: "zm_zaopi_distance",
		subSkill: {
			distance: {
				intro: {
					content: "你计算与其他角色的距离-#",
				},
				mod: {
					globalFrom(from, to, current) {
						return current - from.countMark("zm_zaopi_distance");
					},
				},
			},
		},
		ai: {
			result: {
				player(player, target, card) {
					return player.hp > 1;
				},
			},
		},
	},
});
