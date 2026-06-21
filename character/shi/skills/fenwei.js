import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

/**
 * 记录一次“奇袭”效果的执行，并检测是否能恢复奋威
 * @param {GameEvent} event 
 * @param {Player} player 
 */
export async function fenweiCheckRestore(event, player) {
	const restorer = "zm_fenwei_restorer";
	if (!player.hasSkill(restorer)) return;
	player.addMark(restorer, 1, false);
	if (player.countMark(restorer) >= 3)
		await event.trigger("zm_fenwei_restore");
}

export default new SkillData("zm_fenwei|奋威", {
	description:
		"<b>限定技</b>，当一张牌指定多个目标时，你可以取消其中任意个。" +
		"然后当你执行三次“奇袭”效果后，此技能可再次发动。",
	voices: [
		"舍身护主，扬吴将之风！",
		"袭军挫阵，奋江东之威！",
	],
	skill: {
		limited: true,
		skillAnimation: true,
		animationColor: "wood",
		trigger: { global: "useCardToPlayer" },
		filter(event, player, name, target) {
			return event.isFirstTarget &&
				event.targets.length > 1 &&
				!get.info(event.card).multitarget;
		},
		async cost(event, trigger, player) {
			event.result = await player.chooseTarget({
				prompt: get.prompt("zm_fenwei"),
				prompt2: `取消${get.translation(trigger.card)}的任意个目标`,
				filterTarget(card, player, target) {
					return trigger.targets.includes(target);
				},
				selectTarget: [1, trigger.targets.length],
				ai(target) {
					return -get.effect(target, trigger.card, trigger.player, player);
				},
			}).forResult();
		},
		async content(event, trigger, player) {
			player.awakenSkill(event.name);
			player.addSkill("zm_fenwei_restorer");
			trigger.getParent()?.excluded.addArray(event.targets);
		},
		subSkill: {
			restorer: {
				onremove: true,
				intro: {
					content: "距上次发动奋威后，已执行#次“奇袭”效果",
				},

				audio: "zm_fenwei",
				charlotte: true,
				forced: true,
				trigger: {
					player: "zm_fenwei_restore",
				},
				async content(event, trigger, player) {
					game.log(
						player,
						"的技能",
						`【${get.translation("zm_fenwei")}】`,
						"恢复了",
					);
					player.restoreSkill("zm_fenwei");
					player.removeSkill(event.name);
				},
			},
		},
		ai: {
			combo: "zm_qixi",
		},
	},
});
