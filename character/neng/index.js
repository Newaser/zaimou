import skills from "./skill-index.js";
import { CharacterSubackage } from "../../utils/import.js";
import { Character } from "../../../../noname/library/element/index.js";
import { lib } from "../../../../noname.js";

export default new CharacterSubackage("zm_neng|再谋篇·能")
	.addSkills(skills)
	.addCharacter("zm_sunjian|谋孙坚", {
		basic: new Character({
			sex: "male",
			group: "wu",
			hp: 4,
			skills: ["zm_polu", "zm_xuanwei", "zm_wulie"],
		}),
		title: "武烈开疆",
		dieVoice: "吾身虽死，忠勇须传……",
		rank: "am",
		rarity: "epic",
	})


	.addCharacter("zm_jiangwei|谋姜维", {
		basic: new Character({
			sex: "male",
			group: "shu",
			hp: 4,
			skills: ["zm_tiaoxin", "zm_zhiji"],
		}),
		title: "见危授命",
		dieVoice: "剑阁戎声，残阳殷血，犹鉴丹心……",
		rank: "am",
		rarity: "epic",
		runtime1(data) {
			lib.characterSubstitute["zm_jiangwei"] = [
				["zm_jiangwei_gazing", []],
				["zm_jiangwei_wu", []],
				["zm_jiangwei_wen", []],
				["zm_jiangwei_beishui", []],
			];
		},
	})
	.addCharacter("zm_jiangwei_gazing|谋姜维", {
		basic: new Character({
			sex: "male",
			group: "shu",
			hp: 4,
			skills: ["zm_tiaoxin", "zm_zhiji"],
			isUnseen: true,
		}),
		title: "见危授命",
		dieVoice: "维实无能，无以助陛下再立基业……",
		rank: "am",
		rarity: "epic",
		audioRedirect: {
			"zm_zhiji": [
				"北定中原终有日！",
				"虽至绝境，吾亦有奇略可施。",
			],
		},
	})
	.addCharacter("zm_jiangwei_wu|谋姜维", {
		basic: new Character({
			sex: "male",
			group: "shu",
			hp: 4,
			skills: ["zm_tiaoxin", "zm_zhiji"],
			isUnseen: true,
		}),
		title: "见危授命",
		dieVoice: "思远已失绵竹，吾岂可再败钟会……",
		rank: "am",
		rarity: "epic",
		audioRedirect: {
			"zm_zhiji": [
				"总有万险，岂可负丞相之任哉！",
				"大业若不能成，何面以见汉室英烈！",
			],
			"zm_huoji": [
				"此炬虽未星火，然终有燎原之日。",
				"天下今幽，维当燃犀，以身照夜。",
			],
		},
	})
	.addCharacter("zm_jiangwei_wen|谋姜维", {
		basic: new Character({
			sex: "male",
			group: "shu",
			hp: 4,
			skills: ["zm_tiaoxin", "zm_zhiji"],
			isUnseen: true,
		}),
		title: "见危授命",
		dieVoice: "丞相……维志浅力微，有负此任……",
		rank: "am",
		rarity: "epic",
		audioRedirect: {
			"zm_zhiji": [
				"为成大计，吾等当前赴后继。",
				"以身擎国，誓成丞相夙愿。",
			],
			"mbxinghun": [
				"天命或有定，人为必改之！",
				"将星临斗，必照汉室以光复！",
			],
		},
	})
	.addCharacter("zm_jiangwei_beishui|谋姜维", {
		basic: new Character({
			sex: "male",
			group: "shu",
			hp: 4,
			skills: ["zm_tiaoxin", "zm_zhiji"],
			isUnseen: true,
		}),
		title: "见危授命",
		dieVoice: "纵殒命沙场，亦要全先帝之业……",
		rank: "am",
		rarity: "epic",
		audioRedirect: {
			"zm_zhiji": [
				"但恐兴复无望，何惧粉身碎骨！",
				"此身尚未燃尽，何敢言已尽全功！",
			],
			"zm_huoji": [
				"焚魂燃魄，不足表复汉之心！",
				"此身愿为星火，以照兴汉之途！",
			],
		},
		runtime2(data) {
			if (!lib.skill["mbxinghun"].audioname2) {
				lib.skill["mbxinghun"].audioname2 = {};
			}
			lib.skill["mbxinghun"].audioname2["zm_jiangwei_beishui"] =
				"zm_huoji__zm_jiangwei_beishui";
		},
	});
