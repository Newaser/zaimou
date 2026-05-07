import * as util from "../../../utils/util.js";
import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

export default new SkillData("zm_tianyi|天义", {
	description:
		`<b>限定技</b>，准备阶段，你可以选择一名其他角色，与其进行“${get.poptip("rule_xieli")}”。` +
		`其结束阶段，若你与其“协力”成功，则你与其进入“${get.poptip("zm_luli_state")}”状态。`,
	voices: [
		"天道择义而襄，英雄待机而胜！",
		"幸遇伯符，吾之壮志成矣！",
	],
	skill: {
		logAudio: util.logSkillAudio("zm_tianyi", 1),
		limited: true,
		skillAnimation: false,
		trigger: {
			player: "phaseZhunbei",
		},
		async cost(event, trigger, player) {
			event.result = await player.chooseTarget({
				prompt: get.prompt("zm_tianyi"),
				prompt2: "与一名其他角色进行“协力”，成功后你们进入“戮力”状态",
				filterTarget: lib.filter.notMe,
				ai(target) {
					if (get.attitude(player, target) <= 0)
						return -1;
					const a = target.isTurnedOver() || target.hasJudge("lebu") ?
						0.1 : 1;
					return a * Math.sqrt(1 + target.countCards("h")) *
						get.threaten(target) - 1.5;
				},
			}).forResult();
		},
		async content(event, trigger, player) {
			player.awakenSkill(event.name);
			/** @type {GameEvent} */
			const next = player.chooseCooperationFor({
				target: event.targets[0],
				reason: event.name,
			});
			/**
			 * AI选择按钮时的优先级评分函数
			 * 
			 * @param button - 选择的按钮
			 * @RETURNS 选择该按钮的优先级评分
			 */
			next.ai = (button) => {
				const baseMap = {
					"cooperation_damage": 0.2,
					"cooperation_draw": 0.6,
					"cooperation_discard": 0.1,
					"cooperation_use": 0.5,
				};
				return baseMap[button.link] + Math.random();
			};

			await next;
			player.addAdditionalSkill("cooperation", "zm_tianyi_check");
		},
		subSkill: {
			check: {
				logAudio: util.logSkillAudio("zm_tianyi", 2),
				charlotte: true,
				forced: true,
				skillAnimation: true,
				animationColor: "green",
				trigger: {
					global: "phaseJieshu",
				},
				logTarget: "player",
				filter(event, player, name, target) {
					return player.checkCooperationStatus(event.player, "zm_tianyi");
				},
				async content(event, trigger, player) {
					const to = trigger.player;
					game.log(player, "和", to, "的协力成功");
					game.log(player, "和", to, "进入", "#g戮力", "状态");

					player.addSkill("zm_luli");
					to.addSkill("zm_luli");
					await game.delay();
				},
			},
		},
		derivation: "zm_luli",
	},
});
