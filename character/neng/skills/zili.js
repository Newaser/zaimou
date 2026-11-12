import * as util from "../../../utils/util.js";
import { URL } from "../../../utils/constants.js";
import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

const CHOICES = [
	"摸一张牌并蓄谋",
	"获得【排异】",
	"自立",
];

/**
 * @param {Player} player 
 * @returns {boolean}
 */
function canZili(player) {
	if (player.storage.rule_zm_zili === true) return false;
	/** @type {string} */
	const mode = get.mode();
	if (mode == "identity") {
		return player.identityShown ||
			player.countCards("j", card => card.name == "xumou_jsrg") >= 3;
	} else if (mode == "versus") {
		return player.countCards("j", card => card.name == "xumou_jsrg") >= 3 ||
			game.dead.some(i => i.isFriendOf(player));
	} else if (mode == "doudizhu") {
		return player == game.zhu ||
			player.countCards("j", card => card.name == "xumou_jsrg") >= 3 ||
			game.dead.some(i => i.isFriendOf(player));
	}
	return false;
}

/**
 * @param {Player} player 
 */
async function zili(player) {
	/** @param {Player} p */
	async function draw2AndRecover(p) {
		await p.draw(2);
		await player.recover();
	}
	/** @param {Player} p */
	function addFybh(p) {
		p.addSkillLog("jsrgfeiyang");
		p.addSkillLog("jsrgbahu");
	}

	if (!canZili(player)) return;
	player.storage.rule_zm_zili = true;

	/** @type {string} */
	const mode = get.mode();
	if (mode == "identity") {
		if (player.identityShown) {
			await draw2AndRecover(player);
		} else {
			addFybh(player);
		}
	} else if (mode == "versus") {
		addFybh(player);
	} else if (mode == "doudizhu") {
		if (player == game.zhu) {
			await draw2AndRecover(player);
		} else {
			addFybh(player);
		}
	}
}

export default new SkillData("zm_zili|自立", {
	description:
		"准备阶段或当你受到1点伤害后，你可选择一项：摸一张牌并蓄谋；" +
		`获得${get.poptip("zm_paiyi")}；${get.poptip("rule_zm_zili")}。`,
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
		/** @type {import("../../../utils/type.ts").LogAudioFunc} */
		logAudio(event, player, name, indexedData, result) {
			/** @type {string} */
			const control = result?.cost_data.control || "";
			const idx = CHOICES.indexOf(control) * 2 + [1, 2].randomGet();
			return `${URL.SKILL_AUDIO}/zm_zili${idx}.mp3`;
		},
		trigger: { player: ["phaseZhunbeiBegin", "damageEnd"] },
		getIndex(event, player, triggername) {
			return triggername == "damageEnd" ? event.num : 1;
		},
		async cost(event, trigger, player) {
			const controls = [CHOICES[0]];
			if (!player.hasSkill("zm_paiyi")) controls.push(CHOICES[1]);
			if (canZili(player)) controls.push(CHOICES[2]);

			if (controls.length == 1) {
				/** @type {Result} */
				const result = await player.chooseBool({
					prompt: `自立：是否${CHOICES[0]}？`,
					choice: true,
				}).forResult();
				if (result.bool) {
					event.result = {
						bool: true,
						cost_data: { control: CHOICES[0] },
					};
				}
			} else {
				controls.push("cancel2");
				/** @type {Result} */
				const result = await player.chooseControl({
					prompt: "自立：你可以选择一项",
					controls,
					choice: controls.length - 2,
				}).forResult();
				if (result.control != "cancel2") {
					event.result = {
						bool: true,
						cost_data: { control: result.control },
					};
				}
			}
		},
		async content(event, trigger, player) {
			/** @type {string} */
			const control = event.cost_data.control;
			if (control == CHOICES[0]) {
				await player.draw();
				await util.xumou(player);
			} else if (control == CHOICES[1]) {
				player.addSkillLog("zm_paiyi");
			} else {
				const animateName = `${event.name}_animate`;
				player.trySkillAnimate(animateName, animateName, true);
				await zili(player);
			}
		},
		subSkill: {
			animate: {
				skillAnimation: true,
				animationColor: "thunder",
			},
		},
		derivation: "zm_paiyi",
	},
});
