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
	description: "当你受到伤害时，你可以防止之。若如此做，你减1点体力上限并加1点蓄力上限。",
	voices: [
		"蜀地天险，岂挡我军去路！",
		"今马革山已取，众将随我冲！",
	],
	skill: {
		chargeSkill: 0,
		trigger: { player: "damageBegin4" },
		check(event, player, triggername, indexedData) {
			return player.isDamaged();
		},
		async content(event, trigger, player) {
			trigger.cancel();
			await player.loseMaxHp();
			game.log(player, "的蓄力值上限+1");
			player.addMark("zm_kexian", 1, false);
			if (player.hasSkill("zm_yaoji"))
				player.markSkill("zm_yanji");
		},
		mod: {
			maxCharge(player, num) {
				return num + player.countMark("zm_kexian");
			},
		},
		ai: {
			maixie: true,
			maixie_defend: true,
		},
	},
});
