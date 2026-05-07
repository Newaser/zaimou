import skills from "./skill-index.js";
import { CharacterSubackage } from "../../utils/import.js";
import { Character } from "../../../../noname/library/element/index.js";

export default new CharacterSubackage("zm_tong|再谋篇·同")
	.addSkills(skills)
	.addCharacter("zm_taishici|谋太史慈", {
		basic: new Character({
			sex: "male",
			group: "wu",
			hp: 4,
			skills: ["zm_shenzhuo", "zm_hanzhan", "zm_tianyi"],
			// for test
			// skills: [
			// 	"zm_shenzhuo", "zm_hanzhan", "zm_tianyi",
			// 	"zm_luli_test1", "zm_luli_test2",
			// ],
		}),
		title: "神亭夺鍪",
		dieVoice: "身证大义，魂念江东……",
		rank: "a",
		rarity: "epic",
	});
