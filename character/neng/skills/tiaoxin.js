import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

export default new SkillData("zm_tiaoxin|挑衅", {
	description:
		"其他角色的出牌阶段开始时，你可以与其拼点：" +
		"若你赢，你弃置其一张牌且可以获得之；否则，视为其对你使用一张普通【杀】。",
	voices: [
		"汝等小儿，还不快跨马来战！",
		"哼！既匹夫不战，不如归耕陇亩！",
	],
	skill: {
		trigger: {
			global: "phaseUseBegin",
		},
		logTarget: "player",
		filter(event, player, name, target) {
			return event.player != player &&
				player.canCompare(event.player);
		},
		check(event, player, triggername, target) {
			return get.attitude(player, event.player) < 0 ||
				player.countCards("h") == 1;
		},
		async content(event, trigger, player) {
			const to = trigger.player;
			/** @type {Result} */
			const result1 = await player.chooseToCompare(to).forResult();
			if (result1.bool) {
				/** @type {Result} */
				const result2 = await player.discardPlayerCard({
					forced: true,
					target: to,
					position: "he",
				}).forResult();
				const cards = result2.cards.filterInD("d");
				if (cards.length > 0) {
					/** @type {Result} */
					const result3 = await player.chooseBool({
						prompt: `挑衅：是否获得${get.translation(cards)}`,
					}).forResult();
					if (result3.bool) {
						player.gain({
							cards,
							source: to,
							animate: "gain2",
						});
					}
				}
			}
			else {
				to.useCard({
					//@ts-expect-error 可以这样
					card: {
						name: "sha",
						isCard: true,
					},
					targets: [player],
				});
			}
		},
	},
});
