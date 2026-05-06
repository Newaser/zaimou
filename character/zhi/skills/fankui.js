import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

export default new SkillData("zm_fankui|反馈", {
	description: "当你受到1点伤害后，你可以观看伤害来源的手牌并获得其一张牌，此牌不计入你的手牌上限。",
	voices: [
		"哼，鹿死谁手，尚未可知。",
		"动我分毫，必有所失！",
	],
	skill: {
		trigger: {
			player: "damageEnd",
		},
		logTarget: "source",
		getIndex(event, player) {
			return event.num;
		},
		filter(event, player, name, target) {
			const position = event.source == player ? "e" : "he";
			return event.num > 0 &&
				event.source?.countGainableCards(player, position) > 0;
		},
		async content(event, trigger, player) {
			const position = trigger.source == player ? "e" : "he";
			/** @type {Result} */
			const result = await player.choosePlayerCard({
				target: trigger.source,
				position,
				visible: true,
				forced: true,
				prompt: `获得${get.translation(trigger.source)}一张牌`,
				ai(button) {
					const sgn =
						get.attitude(player, trigger.source) > 0 ? -1 : 1;
					return sgn * get.buttonValue(button);
				},
			}).forResult();
			await player.gain({
				cards: result.cards,
				source: trigger.source,
				animate: "giveAuto",
				gaintag: ["zm_fankui"],
				bySelf: true,
			});
		},
		mod: {
			ignoredHandcard(card, player, current) {
				if (card.hasGaintag("zm_fankui"))
					return true;
			},
			cardDiscardable(card, player, eventName, result) {
				if (eventName == "phaseDiscard" && card.hasGaintag("zm_fankui"))
					return false;
			},
		},
		ai: {
			maixie_defend: true,
			effect: {
				target(card, player, target, result2) {
					if (player.countCards("he") > 1 && get.tag(card, "damage")) {
						if (player.hasSkillTag("jueqing", false, target)) {
							return [1, -1.5];
						}
						if (get.attitude(target, player) < 0) {
							return [1, 1];
						}
					}
				},
			},
		},
	},
});
