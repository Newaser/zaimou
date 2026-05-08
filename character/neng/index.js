import skills from "./skill-index.js";
import { CharacterSubackage } from "../../utils/import.js";
import { Character } from "../../../../noname/library/element/index.js";

export default new CharacterSubackage("zm_neng|再谋篇·能")
	.addSkills(skills)
	.addCharacter("zm_sunjian|谋孙坚", {
		basic: new Character({
			sex: "male",
			group: "wu",
			hp: 4,
			skills: ["zm_polu", "zm_xuanwei"],
		}),
		title: "武烈开疆",
		dieVoice: "吾身虽死，忠勇须传……",
		rank: "am",
		rarity: "epic",
	});
