import * as util from "../../../utils/util.js";
import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

export default new SkillData("zm_qianxi|潜袭", {
	description:
		"当你使用【杀】指定目标后，你可以摸一张牌并弃置1~2张牌，" +
		"目标角色本回合不能使用或打出与弃置的牌颜色相同的牌。" +
		"每回合限一次，当其他角色回复或失去体力后，" +
		"你可以将一张牌当无次数限制且无视防具的普通【杀】对其使用。",
	voices: [
		"叛夫小儿，快快授首！",
		"擒贼先擒王，打蛇打七寸！",
		"潜军待阵，袭杀逆贼！",
		"暗影深处，袭敌斩首！",
	],
	skill: {
		logAudio: util.logSkillAudio("zm_qianxi", [1, 2]),
		trigger: {
			player: "useCardToPlayered",
		},
		logTarget: "target",
		prompt2: "你可以摸一张牌并弃置1~2张牌，目标角色本回合不能使用或打出与弃置的牌颜色相同的牌",
		filter(event, player, name, target) {
			return event.card.name == "sha";
		},
		async content(event, trigger, player) {
			const to = trigger.target;

			await player.draw();
			/** @type {Result} */
			const result = await player.chooseToDiscard({
				forced: true,
				selectCard: [1, 2],
				ai(card) {
					if (ui.selected.cards.length > 0)
						return -1;
					const colorValue = { "black": 0, "red": 0 };
					const
						kMap = { true: ["black", "red"], false: ["red", "black"] },
						[k1, k2] = kMap[to.isPhaseUsing()];
					if (!to.storage.zm_qianxi_ban?.includes(k1)) {
						colorValue[k1] = 100;
					}
					if (!to.storage.zm_qianxi_ban?.includes(k2)) {
						colorValue[k2] = 3.5;
					}
					const sgn = get.attitude(player, to) > 0 ? -1 : 1;
					// console.log([
					// 	`k1, k2: ${k1}, ${k2}`,
					// 	`sgn: ${sgn}`,
					// 	`color: ${get.color(card)}`,
					// 	`colorValues: ${JSON.stringify(colorValue)}`,
					// 	`cardValue: ${get.value(card, player)}`,
					// 	`return: ${sgn * colorValue[get.color(card)] - get.value(card, player)}`,
					// ].join("\n"));
					return sgn * colorValue[get.color(card)] - get.value(card, player);
				},
			}).forResult();

			to.addTempSkill("zm_qianxi_ban");
			if (!to.storage.zm_qianxi_ban) {
				to.storage.zm_qianxi_ban = [];
			}
			to.storage.zm_qianxi_ban.addArray(result.cards.map(i => get.color(i)));
			to.storage.zm_qianxi_ban = [...new Set(to.storage.zm_qianxi_ban)];
			to.storage.zm_qianxi_ban_markcount = to.storage.zm_qianxi_ban.length;
			to.updateMark("zm_qianxi_ban");
		},
		ai: {
			presha: true,
		},
		group: ["zm_qianxi_ambush", "zm_qianxi_unequip"],
		subSkill: {
			ambush: {
				trigger: {
					global: ["recoverEnd", "loseHpEnd"],
				},
				filter(event, player, name, target) {
					return !player.hasSkill("zm_qianxi_used") &&
						event.player != player &&
						player.countCards("hes") > 0;
				},
				direct: true,
				async content(event, trigger, player) {
					const to = trigger.player;
					await util.chooseToViewAs(player, {
						viewAs: {
							name: "sha",
							//@ts-expect-error 可以加
							storage: {
								zm_qianxi: true,
							},
						},
						onuse(result, player) {
							player.addTempSkill("zm_qianxi_used");
							player.logSkill("zm_qianxi_ambush", to);
							util.playSkillAudio("zm_qianxi", [3, 4], false, player);
						},

						prompt: get.prompt("zm_qianxi", to),
						prompt2: "将一张牌当无次数限制且无视防具的普通【杀】对其使用",

						position: "hes",

						filterTarget(card, player, target) {
							return target == to;
						},
						ai1(card) {
							if (get.attitude(player, to) < 0) {
								return Infinity - get.value(card, player);
							}
							return -1;
						},
					});
				},
			},
			unequip: {
				charlotte: true,
				firstDo: true,
				direct: true,
				trigger: {
					player: "useCardToPlayered",
				},
				filter(event, player, name, target) {
					return event.card.storage?.zm_qianxi;
				},
				async content(event, trigger, player) {
					const to = trigger.target;
					to.addTempSkill("qinggang2");
					to.storage.qinggang2.add(trigger.card);
					to.markSkill("qinggang2");
				},
			},
			ban: {
				mark: true,
				onremove: true,
				intro: {
					content(storage, player) {
						const colors = storage.map((/** @type {string} */ i) =>
							get.translation(i)).join("、 ");
						return `本回合不能使用或打出${colors}牌`;
					},
				},
				mod: {
					cardEnabled2(card, player, result) {
						const
							storage = player.storage.zm_qianxi_ban,
							color = get.color(card, player);
						if (get.itemtype(card) == "card" && storage.includes(color)) {
							return false;
						}
					},
				},
			},
			used: {},
		},
	},
});
