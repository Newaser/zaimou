import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

export default new SkillData("zm_huoji|火计", {
	description:
		"出牌阶段限一次，你可以选择一名其他角色，对其及其同势力的其他角色各造成1点火焰伤害。",
	voices: ["", ""],
	skill: {
		enable: "phaseUse",
		usable: 1,
		filterTarget: lib.filter.notMe,

		line: "fire",
		prompt: "选择一名其他角色，对其及与其势力相同的所有其他角色各造成1点火属性伤害",
		async content(event, trigger, player) {
			const to = event.target;
			await to.damage({ nature: "fire" });
			const others = game.filterPlayer(p =>
				p != player &&
				p != to &&
				p.group == to.group,
			);
			if (others.length) {
				await game.delayx();
				player.line(others, "fire");
				others.forEach(async o => await o.damage({ nature: "fire" }));
			}
		},
		ai: {
			order: 7,
			fireAttack: true,
			result: {
				target(player, target, card) {
					return game.filterPlayer(p =>
						p != player &&
						p.group == target.group,
					).reduce((acc, cur) => {
						return acc + get.damageEffect(cur, player, player, "fire");
					}, 0);
				},
			},
		},
	},
});
