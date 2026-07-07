import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

const DESCRIPTIONS = [
	`<b>${get.poptip("contract_skill")}</b>，当你受到伤害时，你可以防止之。若如此做，你减1点体力上限并加1点蓄力上限。`,
	"<b>锁定技</b>，当你受到伤害时，你防止之。若如此做，你减1点体力上限并加1点蓄力上限。",
];

/**
 * @param {Player} player 
 */
function gianMaxCharge(player) {
	game.log(player, "的蓄力值上限+1");
	player.storage.zm_kexian_maxChargePlus++;
	if (player.hasSkill("zm_yanji"))
		player.markSkill("zm_yanji");
}

export default new SkillData("zm_kexian|克险", {
	description: DESCRIPTIONS[0],
	dynamicDescription(player, desc) {
		if (player.storage.zm_kexian) {
			return DESCRIPTIONS[1];
		}
	},
	voices: [
		"蜀地天险，岂足挡我军去路！",
		"今马革山已取，众将随我冲！",
	],
	texts: {
		"(poptip)contract_skill|契定技":
			"发动一次后，此技能契定技标签改为锁定技并删除技能描述中的“可以”。",
	},
	skill: {
		trigger: { player: "damageBegin4" },
		async cost(event, trigger, player) {
			if (!player.storage.zm_kexian) {
				event.result = await player.chooseBool({
					prompt: get.prompt("zm_kexian"),
					prompt2: get.skillInfoTranslation("zm_kexian"),
					ai(event, _) {
						return player.isDamaged();
					},
				}).forResult();
			} else {
				event.result = { bool: true };
			}
		},
		async content(event, trigger, player) {
			const skillName = event.name;
			if (!player.storage[skillName]) {
				const animateName = `${skillName}_animate`;
				player.trySkillAnimate(animateName, animateName, true);
				player.storage[skillName] = true;
			}
			trigger.cancel();
			await player.loseMaxHp();
			gianMaxCharge(player);
		},
		group: "zm_kexian_maxChargePlus",
		subSkill: {
			animate: {
				skillAnimation: true,
				animationColor: "thunder",
			},
			maxChargePlus: {
				init(player, skill) {
					player.setStorage(skill, 0);
				},
				mod: {
					maxCharge(player, num) {
						return num + player.storage.zm_kexian_maxChargePlus;
					},
				},
			},
		},
		ai: {
			combo: "zm_yanji",
		},
	},
});
