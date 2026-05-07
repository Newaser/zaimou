import skills from "./skill-index.js";
import { CharacterSubackage } from "../../utils/import.js";
import { Character } from "../../../../noname/library/element/index.js";

export default new CharacterSubackage("zm_zhi|再谋篇·知")
	.addSkills(skills)
	.addCharacter("zm_simayi|谋司马懿", {
		basic: new Character({
			sex: "male",
			group: "wei",
			hp: 3,
			skills: ["zm_fankui", "zm_guicai", "zm_fuye"],
			doubleGroup: ["wei", "jin"],
		}),
		title: "重张区宇",
		dieVoice: "筹谋半生事，逢日俱化空……",
		rank: "s",
		rarity: "legend",
		audioRedirect: {
			"mbdangyi": [
				"司马氏江山，自不容怀异之徒！",
				"哼！斩首示众，以儆效尤。",
			],
			"lianpo": [
				"为成天下之业，当立万骨之枯！",
				"天下归一之功，已近在咫尺！",
			],
		},
	});

