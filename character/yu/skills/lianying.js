import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

export default new SkillData("zm_lianying|连营", {
	description:
		"<b>锁定技</b>，当你失去最后的手牌时，你摸X+1张牌（X为你已损失的体力值数，至多为2）。",
	voices: [
		"敌军兵众随锐，然以疑兵之计怠其心，亦可破之！",
		"细心筹谋，以虑后计。",
	],
	skill: {
		forced: true,
		trigger: {
			player: "loseAfter",
			global: [
				"equipAfter",
				"addJudgeAfter",
				"gainAfter",
				"loseAsyncAfter",
				"addToExpansionAfter",
			],
		},
		filter(event, player, name, target) {
			const evt = event.getl(player);
			return evt?.hs?.length && player.countCards("h") == 0;
		},
		async content(event, trigger, player) {
			const x = Math.min(player.getDamagedHp(), 2);
			await player.draw(x + 1);
		},
		ai: {
			noh: true,
			skillTagFilter(player, tag, arg) {
				return player.countCards("h") == 1;
			},
		},
	},
});
