import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

export default new SkillData("zm_houqi|后起", {
	description:
		"<b>觉醒技</b>，准备阶段，若游戏轮数不小于你的体力值，" +
		`你失去${get.poptip("zm_qiantui")}并获得${get.poptip("zm_zongyan")}。`,
	voices: [
		"手提御剑斥千军，昔日锦鲤化金龙！",
		"蜀军虚实已知，吾等不日便破也。",
	],
	skill: {
		forced: true,
		juexingji: true,
		skillAnimation: true,
		animationColor: "green",
		trigger: {
			player: "phaseZhunbei",
		},
		filter(event, player, name, target) {
			return game.roundNumber >= player.hp;
		},
		async content(event, trigger, player) {
			player.awakenSkill(event.name);
			player.changeSkin("zm_houqi", "zm_luxun_awakened");
			player.removeSkill("zm_qiantui");
			player.addSkill("zm_zongyan");
		},
		ai: {
			effect: {
				target(card, player, target, result2) {
					if (target.awakenedSkills.includes("zm_houqi") ||
						game.roundNumber >= player.hp)
						return;

					const qiantuiFilter = player != target &&
						(card.name == "sha" || get.type2(card) == "trick") &&
						target.countCards("he") > 0;
					if (target.hasSkill("zm_qiantui") && qiantuiFilter ||
						get.is.damageCard(card) && target.hujia == 0) {
						return [1, 5];
					}
				},
			},
		},
		derivation: "zm_zongyan",
	},
});
