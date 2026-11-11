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
	},
});
