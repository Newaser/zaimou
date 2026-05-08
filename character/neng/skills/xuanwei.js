import * as util from "../../../utils/util.js";
import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

import { upgradeYinghun, yinghunCostAi } from "./yinghun.js";

export default new SkillData("zm_xuanwei|宣威", {
	description:
		`<b>使命技</b>，游戏开始时，你获得${get.poptip("zm_yinghun")}。` +
		`<br>成功：当你杀死一名没有手牌的角色后，你回复所有体力、失去${get.poptip("zm_polu")}、` +
		`获得${get.poptip("zm_wulie")}、升级〖英魂〗。` +
		"<br>失败：当你于回合外进入濒死状态时，你可以发动〖英魂〗。",
	voices: [
		"洛阳已在眼下，莫让董贼轻逃！",
		"破虏建功，扬威天下！",
		"董贼势败在即，诸公何故不前！",
	],
	skill: {
		dutySkill: true,
		group: ["zm_xuanwei_start", "zm_xuanwei_achieve", "zm_xuanwei_fail"],
		subSkill: {
			start: {
				logAudio: util.logSkillAudio("zm_xuanwei", 1),
				forced: true,
				locked: false,
				trigger: {
					global: "phaseBefore",
					player: "enterGame",
				},
				filter(event, player, name, target) {
					return event.name != "phase" ||
						game.phaseNumber == 0;
				},
				async content(event, trigger, player) {
					await player.addSkill("zm_yinghun");
				},
			},
			achieve: {
				logAudio: util.logSkillAudio("zm_xuanwei", 2),
				forced: true,
				locked: false,
				skillAnimation: true,
				animationColor: "green",
				trigger: {
					source: ["die", "dieAfter"],
				},
				filter(event, player, name, target) {
					if (name == "die") {
						return event.player.countCards("h") == 0;
					}
					return event.player == player.storage.zm_xuanwei_killed;
				},
				async content(event, trigger, player) {
					if (trigger.triggername == "die") {
						player.storage.zm_xuanwei_killed = trigger.player;
					}
					delete player.storage.zm_xuanwei_killed;
					player.awakenSkill("zm_xuanwei");
					game.log(player, "成功完成使命");
					await player.recover({ num: player.getDamagedHp() });
					player.changeSkills(["zm_wulie"], ["zm_polu"]);
					upgradeYinghun(player);
				},
			},
			fail: {
				logAudio: util.logSkillAudio("zm_xuanwei", 3),
				forced: true,
				locked: false,
				trigger: {
					player: "dying",
				},
				filter(event, player, name, target) {
					return player != _status.currentPhase;
				},
				async content(event, trigger, player) {
					player.awakenSkill("zm_xuanwei");
					game.log(player, "使命失败");

					if (player.isHealthy()) return;
					/** @type {Result} */
					const result = await player.chooseTarget({
						prompt: "宣威：使命已失败，你可以对一名其他角色发动【英魂】",
						filterTarget: lib.filter.notMe,
						ai: yinghunCostAi,
					}).forResult();
					if (result.bool) {
						player.useSkill({
							skill: "zm_yinghun",
							targets: result.targets,
							addCount: false,
						});
					}
				},
			},
		},
		derivation: ["zm_yinghun", "zm_wulie"],
	},
});
