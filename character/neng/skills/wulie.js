import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

export default new SkillData("zm_wulie|武烈", {
	description:
		"出牌阶段限一次，你可以令任意名角色各摸一张牌且你失去等量点体力，" +
		"这些角色依次选择一项：获得1点护甲；与你各摸一张牌。",
	voices: [
		"吾身虽已殒，此魂今犹在！",
		"魂佑江东沃土，身卫孙家江山！",
	],
	skill: {
		enable: "phaseUse",
		usable: 1,
		filterTarget: true,
		selectTarget: [1, Infinity],
		multitarget: true,
		multiline: true,
		async content(event, trigger, player) {
			const tos = event.targets.sortBySeat(_status.currentPhase);
			await game.asyncDraw(tos);
			await player.loseHp(tos.length);
			for (const to of tos) {
				if (to.hujia >= 5) {
					await game.asyncDraw([to, player]);
					continue;
				}
				/** @type {Result} */
				const result = await to.chooseControl({
					prompt: `武烈：你须获得1点护甲或与${get.translation(player)}各摸一张牌`,
					controls: ["获得护甲", "一起摸牌"],
					ai(event, _) {
						if (get.attitude(to, player) <= 0)
							return "获得护甲";
						const
							draw = { name: "draw" },
							eff1 = get.recoverEffect(to, player, to),
							eff2 = get.effect(to, draw, player, to) +
								get.effect(player, draw, player, to);
						return eff1 > eff2 ? "获得护甲" : "一起摸牌";
					},
				}).forResult();
				if (result.control == "获得护甲") {
					to.changeHujia(1, "gain", 5);
				} else {
					await game.asyncDraw([to, player]);
				}
			}
		},
		ai: {
			order: 10,
			result: {
				target(player, target, card) {
					if (player.hp - ui.selected.targets.length - 1 <= 0)
						return;
					return 3;
				},
			},
			pretao: true,
		},
	},
});
