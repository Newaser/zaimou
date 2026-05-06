import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

const derivation = ["mbdangyi", "lianpo"];

export default new SkillData("zm_zhengbian|政变", {
	description:
		"<b>限定技</b>，休整结束后，你可以变更势力至晋。" +
		"若如此做，你可以重铸任意张牌，然后你失去1~2点体力并获得" +
		`${get.poptip("mbdangyi")}、${get.poptip("lianpo")}中等量个技能。`,
	voices: [
		"一生辅弼四世业，一朝反覆四朝基。",
		"缩地补天，重张区宇！",
	],
	skill: {
		trigger: { player: "restEnd" },
		forceOut: true,
		limited: true,
		skillAnimation: true,
		animationColor: "thunder",
		prompt: "是否发动【<span style=\"color: #c300ff\">政变</span>】？",
		check(event, player, triggername, target) {
			return game.hasPlayer(i => get.attitude(player, i) <= 0);
		},
		async content(event, trigger, player) {
			player.awakenSkill(event.name);

			await player.changeGroup("jin");

			if (player.hasCard(lib.filter.cardRecastable, "he")) {
				/** @type {Result} */
				const result = await player.chooseCard({
					prompt: "政变：你可以重铸任意张牌",
					filterCard(card, player, event) {
						return lib.filter.cardRecastable(card, player, player);
					},
					selectCard: [1, Infinity],
					position: "he",
					ai(card) {
						return 6 - get.value(card);
					},
				}).forResult();
				if (result.bool) {
					await player.recast(result.cards);
				}
			}

			/** @type {Result} */
			const result = await player.chooseControl({
				prompt:
					"政变：你须失去1~2点体力，以获得" +
					`${get.poptip("mbdangyi")}、${get.poptip("lianpo")}中等量个技能`,
				controls: ["1点", "2点"],
				ai(event, player) {
					if (game.countPlayer(i => get.attitude(player, i) <= 0) > 1) {
						return "2点";
					}
					return "1点";
				},
			}).forResult();
			if (result.control == "1点") {
				/** @type {Result} */
				const result2 = await player.chooseControl({
					prompt: "政变：请选择一个技能获得",
					controls: derivation,
					ai(event, player) {
						return derivation[0];
					},
				}).forResult();
				await player.loseHp();
				player.addSkill(result2.control);
			} else {
				await player.loseHp(2);
				await player.addSkills(derivation);
			}
		},
		derivation,
	},
});
