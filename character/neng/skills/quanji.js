import * as util from "../../../utils/util.js";
import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

export default new SkillData("zm_quanji|权计", {
	description: "<b>锁定技</b>，若你于回合内蓄谋过，你跳过判定阶段。你的手牌上限+X（X为你场上的牌数）。",
	voices: [
		"昔韩信暗度陈仓，乃定三秦之地。",
		"天下纷乱未已，不可强而夺之。",
		"我蓄此谋已久，试看云翻雨覆！",
		"胸中所负江海，今日终得尽倾！",
	],
	skill: {
		locked: true,
		trigger: {},
		group: [
			"zm_quanji_record",
			"zm_quanji_skip",
			"zm_quanji_burst",
		],
		subSkill: {
			record: {
				charlotte: true,
				direct: true,
				trigger: { player: "addJudgeAfter" },
				filter(event, player, name, indexedData) {
					return event.card.name == "xumou_jsrg" &&
						_status.currentPhase == player;
				},
				async content(event, trigger, player) {
					player.addTempSkill("zm_quanji_xumoued");
				},
			},
			skip: {
				/** @type {import("../../../utils/type.ts").LogAudioFunc} */
				logAudio: util.logSkillAudio("zm_quanji", [1, 2]),
				forced: true,
				trigger: { player: "phaseJudgeBefore" },
				filter(event, player, name, indexedData) {
					return player.hasSkill("zm_quanji_xumoued");
				},
				async content(event, trigger, player) {
					trigger.cancel();
				},
			},
			burst: {
				direct: true,
				lastDo: true,
				trigger: { player: "phaseJudgeBegin" },
				filter(event, player, name, indexedData) {
					return player.hasCard(card => card.name == "xumou_jsrg", "j");
				},
				async content(event, trigger, player) {
					util.playSkillAudio("zm_quanji", [3, 4], false, player);
				},
			},
			xumoued: {},
		},
		mod: {
			maxHandcard(player, num) {
				return num + player.countCards("ej");
			},
		},
	},
});
