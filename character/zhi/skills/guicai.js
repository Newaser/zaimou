import * as util from "../../../utils/util.js";
import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

export default new SkillData("zm_guicai|鬼才", {
	description: "每回合限一次，当一名角色的判定牌生效前，你可以打出一张牌代替之，然后其可以令你摸两张牌。",
	voices: [
		"万象机变，皆系我一掌之中。",
		"把握时局，掌控天下！",
	],
	skill: {
		usable: 1,
		trigger: {
			global: "judge",
		},
		filter(event, player, name, target) {
			return player.countCards("hes") > 0;
		},
		async cost(event, trigger, player) {
			event.result = await player.chooseCard({
				prompt:
					`${get.translation(trigger.player)}的${trigger.judgestr || ""}判定为` +
					`${get.translation(trigger.player.judging[0])}，${get.prompt(event.skill)}`,
				position: "hes",
				filterCard(card, player, event) {
					return lib.filter.cardRespondable(card, player, event) || false;
				},
				ai(card) {
					const
						oldJudging = trigger.player.judging[0],
						result = trigger.judge(card) - trigger.judge(oldJudging),
						attitude = get.attitude(player, trigger.player),
						cardValue = get.value(card, player);
					if (attitude == 0) {
						return 0;
					} else if (attitude > 0) {
						if (result == 0) {
							return 9 - cardValue;
						}
						return result - cardValue * 0.01;
					}
					return -result - cardValue * 0.01;
				},
			}).forResult();
		},
		async content(event, trigger, player) {
			const next = player.respond({
				cards: event.cards,
				highlight: true,
				noOrdering: true,
			});
			await next;
			const judgeResult = await util.rejudge(player, trigger, next.cards);
			await game.delay();

			const to = trigger.player;
			/** @type {Result} */
			const result = await to.chooseBool({
				prompt: `鬼才：是否令${get.translation(player)}摸两张牌？`,
				ai(event, _) {
					if (get.attitude(to, player) > 0)
						return true;
					return get.attitude(to, player) == 0 && judgeResult > 0;
				},
			}).forResult();
			if (result.bool) {
				to.line(player);
				await player.draw({ num: 2, source: to });
			}
		},
		ai: {
			rejudge: true,
			tag: { rejudge: 1 },
		},
	},
});
