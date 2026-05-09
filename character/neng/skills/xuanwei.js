import * as util from "../../../utils/util.js";
import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

import { upgradeYinghun } from "./yinghun.js";

export default new SkillData("zm_xuanwei|宣威", {
	description:
		`<b>使命技</b>，游戏开始时，你获得${get.poptip("zm_yinghun")}。` +
		`<br>成功：当你杀死一名没有手牌的角色后，你回复所有体力、失去${get.poptip("zm_polu")}、` +
		`获得${get.poptip("zm_wulie")}、升级〖英魂〗。` +
		"<br>失败：当你于回合外进入濒死状态时，若你有〖英魂〗，你可以发动之。",
	voices: [
		"洛阳已在眼下，莫让董贼轻逃！",
		"破虏建功，扬威天下！",
		"董贼势败在即，诸公何故不前！",
	],
	skill: {
		dutySkill: true,
		group: ["zm_xuanwei_start", "zm_xuanwei_dieRecorder", "zm_xuanwei_achieve", "zm_xuanwei_fail"],
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
					await player.addSkillLog("zm_yinghun");
				},
			},
			dieRecorder: {
				charlotte: true,
				direct: true,
				trigger: {
					global: "die",
				},
				async content(event, trigger, player) {
					trigger.player.storage.zm_xuanwei_dieRecorder =
						trigger.player.countCards("h");
				},
			},
			achieve: {
				logAudio: util.logSkillAudio("zm_xuanwei", 2),
				forced: true,
				locked: false,
				skillAnimation: true,
				animationColor: "green",
				trigger: {
					source: "dieAfter",
				},
				filter(event, player, name, target) {
					return event.player.storage.zm_xuanwei_dieRecorder == 0;
				},
				async content(event, trigger, player) {
					player.awakenSkill("zm_xuanwei");
					game.log(player, "成功完成使命");
					await player.recover({ num: player.getDamagedHp() });
					player.removeSkillLog("zm_polu");
					player.addSkillLog("zm_wulie");
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
					await event.trigger(event.name);
				},
			},
		},
		derivation: ["zm_yinghun", "zm_wulie"],
	},
});
