import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

export default new SkillData("zm_zili|自立", {
	description:
		`准备阶段或当你受到1点伤害后，你可选择一项：摸一张牌并蓄谋；获得〖排异〗；${get.poptip("rule_zm_zili")}。`,
	voices: [
		"晋公既已疑我，吾等亦当早决。",
		"汝等畏懦不前，军权当属我麾下！",
		"匹夫竟先据成都，视我如何人哉！",
		"区区庸人，焉敢染指天下！",
		"晋公相逼如此，不如作而为乱！",
		"成则天下之主，败亦西蜀刘备！",
	],
	texts: {
		"(poptip)rule_zm_zili|自立":
			"每局游戏限一次，你可以自立（自立时需满足相应条件，且自立后你变更势力至群）。" +
			"以下是自立在不同模式下的效果：" +

			"<br>身份：若你的身份牌已亮出，你摸两张牌并回复1点体力；" +
			"否则，若你的蓄谋牌数不小于3，" +
			`你获得${get.poptip("jsrgfeiyang")}、${get.poptip("jsrgbahu")}。` +

			"<br>团战：若你的蓄谋牌数不小于3或已有队友阵亡，" +
			`你获得${get.poptip("jsrgfeiyang")}、${get.poptip("jsrgbahu")}。` +

			"<br>斗地主：若你为地主，你摸两张牌并回复1点体力；" +
			"否则，若你的蓄谋牌数不小于3或已有队友阵亡，" +
			`你获得${get.poptip("jsrgfeiyang")}、${get.poptip("jsrgbahu")}。`,
	},
	skill: {
		derivation: "zm_paiyi",
	},
});
