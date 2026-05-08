import skills from "./skill-index.js";
import { CharacterSubackage } from "../../utils/import.js";
import { Character } from "../../../../noname/library/element/index.js";
import { lib } from "../../../../noname.js";

export default new CharacterSubackage("zm_yu|再谋篇·虞")
	.addSkills(skills)
	.addCharacter("zm_luxun|谋陆逊", {
		basic: new Character({
			sex: "male",
			group: "wu",
			hp: 3,
			skills: ["zm_qiantui", "zm_lianying", "zm_houqi"],
		}),
		title: "儒生雄才",
		dieVoice: "清玉岂容有污，今唯以死自证。",
		rank: "s",
		rarity: "legend",
		runtime1(data) {
			lib.characterSubstitute["zm_luxun"] = [["zm_luxun_awakened", []]];
		},
	})
	.addCharacter("zm_luxun_awakened|谋陆逊", {
		basic: new Character({
			sex: "male",
			group: "wu",
			hp: 3,
			skills: ["zm_qiantui", "zm_lianying", "zm_houqi"],
			isUnseen: true,
		}),
		title: "儒生雄才",
		dieVoice: "虽大败蜀军，却仍未能破孔明之策吗……",
		rank: "s",
		rarity: "legend",
		audioRedirect: {
			"zm_lianying": [
				"其势如火，源源不绝！",
				"吾破敌之策连环相扣，蜀军安能破之？",
			],
		},
	});
