import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

export default new SkillData("zm_qiantui|谦退", {
	description:
		"当你成为其他角色使用的【杀】或锦囊牌的目标后，你可以交给其一张牌并失去1点体力。" +
		"若如此做，此牌对你无效且你获得1点护甲。",
	voices: [
		"谦恭守分，静待天时。",
		"夫唯不争，故天下莫能与之争。",
	],
	skill: {
		trigger: {
			target: "useCardToTargeted",
		},
		logTarget: "player",
		filter(event, player, name, target) {
			return event.player != player &&
				(event.card.name == "sha" || get.type2(event.card) == "trick") &&
				player.countCards("he") > 0;
		},
		async cost(event, trigger, player) {
			event.result = await player.chooseCard({
				prompt: get.prompt("zm_qiantui"),
				prompt2:
					"交给其一张牌并失去1点体力，然后" +
					`${get.translation(trigger.card)}对你无效且你获得1点护甲。`,
				position: "he",
				ai(card) {
					const src = trigger.player;

					player.storage.zm_qiantui_forbidAiEffect = true;
					const eff = get.effect(player, trigger.card, src, player);
					delete player.storage.zm_qiantui_forbidAiEffect;
					if (eff > 0)
						return -1;

					const saves = player.countCards("hs", i =>
						i != card && get.tag(i, "save"));
					if (player.hp + saves <= 1)
						return -1;

					const v1 = get.value(card, player),
						v2 = get.value(card, src);
					if (get.attitude(player, src) > 0)
						return - 0.9 * v1 + v2 + 0.1;
					return Infinity - v1 - v2;
				},
			}).forResult();
		},
		async content(event, trigger, player) {
			await player.give(event.cards, trigger.player);
			await player.loseHp();
			trigger.getParent()?.excluded.add(player);
			await player.changeHujia(1, "gain", 5);
		},
		ai: {
			threaten: 0.85,
			effect: {
				/**
				 * 
				 * @param {Card} card 
				 * @param {Player} player 
				 * @param {Player} target 
				 * @param {Number} result2 
				 * @returns 
				 */
				//@ts-expect-error target_use允许存在
				target_use(card, player, target, result2) {
					if (target.storage.zm_qiantui_forbidAiEffect)
						return;

					const filter = player != target &&
						(card.name == "sha" || get.type2(card) == "trick") &&
						target.countCards("he") > 0;
					if (!filter)
						return;

					if (target.hp <= 1)
						return;

					return [0, -0.65, 1, 0.8];
				},
			},
		},
	},
});
