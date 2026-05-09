import * as util from "../../../utils/util.js";
import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

/**
 * @param {Player} player 
 * @returns {boolean}
 */
function isJiangwei(player) {
	return [player.name, player.name1, player.name2]
		.some(j => j == "zm_jiangwei");
};

/**
 * 
 * @param {Player} player 
 * @param {string} character 
 * @returns {boolean}
 */
function hasSkin(player, character) {
	return Object.values(player.skin || {}).includes(character);
}

/**
 * 
 * @param {Player} player 
 */
async function gazing(player) {
	if (!hasSkin(player, "zm_jiangwei_gazing")) {
		util.playSkillAudio("zm_zhiji__zm_jiangwei_gazing", [1, 2], true, player);
		player.changeSkin("zm_zhiji", "zm_jiangwei_gazing");
		await game.delay();
	}
}

export default new SkillData("zm_zhiji|志继", {
	description:
		"准备阶段，若你没有手牌，你可以摸一张牌并发动" +
		`${get.poptip("zm_huoji")}或${get.poptip("mbxinghun")}。` +
		"<i>背水：减1点体力上限。</i>",
	voices: ["", ""],
	skill: {
		trigger: {
			player: "phaseZhunbeiBegin",
		},
		filter(event, player, name, target) {
			return player.countCards("h") == 0;
		},
		async cost(event, trigger, player) {
			const controls =
				game.hasPlayer(p => p != player) ?
					["火计", "星魂", "背水", "cancel2"] :
					["星魂", "cancel2"];
			/** @type {Result} */
			const result = await player.chooseControl({
				prompt: get.prompt("zm_zhiji"),
				prompt2: get.skillInfoTranslation("zm_zhiji"),
				controls,
				ai(event, player) {
					const others = game.filterPlayer(p => p != player);
					if (others.length > 0 &&
						others.every(p => get.attitude(player, p) > 0)) {
						return "cancel2";
					}
					if (!controls.includes("背水")) {
						return "星魂";
					}
					if (player.maxHp > 1)
						return "背水";
					return ["火计", "星魂"].randomGet();
				},
			}).forResult();
			if (result.control != "cancel2") {
				event.result = {
					bool: true,
					cost_data: { control: result.control },
				};
			}

			const skinMap = {
				"火计": "_wu",
				"星魂": "_wen",
				"背水": "_beishui",
				"cancel2": "",
			};
			if (isJiangwei(player)) {
				player.changeSkin("zm_zhiji", `zm_jiangwei${skinMap[result.control]}`);
			}
		},
		async content(event, trigger, player) {
			await player.draw();

			/** @type {string} */
			const control = event.cost_data.control;
			if (control != "星魂") {
				/** @type {Result} */
				const result = await player.chooseTarget({
					prompt: "火计：选择一名其他角色，对其及与其势力相同的所有其他角色各造成1点火属性伤害",
					filterTarget: lib.filter.notMe,
				}).forResult();
				await player.useSkill({ skill: "zm_huoji", targets: result.targets });
			}
			if (control != "火计") {
				await game.delay(5);
				await player.useSkill({ skill: "mbxinghun" });
			}
			if (control == "背水") {
				await player.loseMaxHp();
			}
		},
		group: ["zm_zhiji_kongcheng", "zm_zhiji_resetSkin"],
		subSkill: {
			kongcheng: {
				direct: true,
				usable: 1,
				trigger: {
					player: "loseAfter",
					global: [
						"equipAfter",
						"addJudgeAfter",
						"gainAfter",
						"loseAsyncAfter",
						"addToExpansionAfter",
					],
				},
				filter(event, player, name, target) {
					return isJiangwei(player) &&
						player != _status.currentPhase &&
						event.getl(player)?.hs?.length > 0 &&
						player.countCards("h") == 0;
				},
				async content(event, trigger, player) {
					await gazing(player);
				},
			},
			resetSkin: {
				charlotte: true,
				direct: true,
				trigger: { global: "phaseAfter" },
				filter(event, player, name, target) {
					return isJiangwei(player);
				},
				async content(event, trigger, player) {
					if (player.countCards("h") == 0) {
						if (player == _status.currentPhase) {
							await gazing(player);
						}
					} else {
						player.changeSkin("zm_zhiji", "zm_jiangwei");
					}
				},
			},
		},
		derivation: ["zm_huoji", "mbxinghun"],
	},
});
