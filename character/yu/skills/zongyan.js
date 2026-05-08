import * as util from "../../../utils/util.js";
import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

export default new SkillData("zm_zongyan|纵炎", {
	description: "你可以将所有手牌当【火攻】对一名其他角色使用。若未造成伤害，本回合此技能失效。",
	voices: [
		"火烧蜀营八百里，扬我东吴万世名！",
		"烽火连绵，尽摧敌营！",
		"大业未能完，此火不可熄……",
	],
	skill: {
		logAudio: util.logSkillAudio("zm_zongyan", [1, 2]),
		enable: "chooseToUse",
		filter(event, player, name, target) {
			return !player.isTempBanned("zm_zongyan");
		},
		viewAs: {
			name: "huogong",
			//@ts-expect-error 可以这样
			storage: {
				mg_zongyan: true,
			},
		},

		filterCard: true,
		selectCard: -1,
		position: "h",

		filterTarget(card, player, target) {
			return target != player &&
				lib.filter.filterTarget(card, player, target);
		},

		group: "zm_zongyan_miss",
		subSkill: {
			miss: {
				direct: true,
				trigger: {
					player: "useCardAfter",
				},
				filter(event, player, name, target) {
					return event.card.storage?.mg_zongyan &&
						!player.hasHistory("sourceDamage",
							evt => evt.card == event.card);
				},
				async content(event, trigger, player) {
					player.tempBanSkill("zm_zongyan");
					util.playSkillAudio("zm_zongyan", 3, false, player);
				},
			},
		},
	},
});
