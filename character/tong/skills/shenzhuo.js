import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

export default new SkillData("zm_shenzhuo|神著", {
	description: "你使用【杀】无距离限制。当你使用【杀】指定一个目标后，你可以观看其手牌并弃置其中一张。",
	voices: [
		"且看此箭之下，焉有偷生之人！",
		"君头已在此，还不授首来降！",
	],
	skill: {
		mod: {
			targetInRange(card, player, target, result) {
				if (card.name == "sha")
					return true;
			},
		},
		trigger: {
			player: "useCardToPlayered",
		},
		logTarget: "target",
		filter(event, player, name, target) {
			return event.card.name == "sha" &&
				event.target.countCards("h") > 0;
		},
		check(event, player, triggername, target) {
			return get.attitude(player, event.target) <= 0;
		},
		prompt2: "观看其手牌并弃置其中一张",
		async content(event, trigger, player) {
			player.discardPlayerCard({
				target: trigger.target,
				position: "h",
				visible: true,
				forced: true,
			});
		},
		ai: {
			presha: true,
		},
	},
});
