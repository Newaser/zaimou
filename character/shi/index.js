import skills from "./skill-index.js";
import { CharacterSubackage } from "../../utils/import.js";
import { Character } from "../../../../noname/library/element/index.js";

export default new CharacterSubackage("zm_shi|再谋篇·识")
	.addSkills(skills)
	.addCharacter("zm_madai|谋马岱", {
		basic: new Character({
			sex: "male",
			group: "shu",
			hp: 4,
			skills: ["mashu", "zm_qianxi"],
		}),
		title: "征西将军",
		dieVoice: "原来……你早有防备……",
		rank: "b",
		rarity: "rare",
	});
