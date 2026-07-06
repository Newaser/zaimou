import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

/**
 * 
 * @param {Player} player 
 * @param {number} [num=1] 
 */
function gainMaxCharge(player, num) {
	player.markSkill("charge");
}

export default new SkillData("zm_kexian|克险", {
	description: "当你受到伤害时，你可以减1点体力上限并防止之，然后你加1点蓄力上限并获得1点蓄力。",
	voices: [
		"蜀地天险，岂挡我军去路！",
		"今马革山已取，众将随我冲！",
	],
	skill: {
		chargeSkill: 0,
		trigger: { player: "damageBegin4" },
		async content(event, trigger, player) {
			await player.loseMaxHp();
			trigger.cancel();
			game.log(player, "的蓄力值上限+1");
			player.addMark("zm_kexian", 1, false);
			player.addCharge(1);
			if (player.hasSkill("zm_yaoji"))
				player.markSkill("zm_yanji");
		},
		mod: {
			maxCharge(player, num) {
				return num + player.countMark("zm_kexian");
			},
		},
	},
});
