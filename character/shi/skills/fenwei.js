import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

export default new SkillData("zm_fenwei|奋威", {
	description:
		"每轮限一次，一名角色的回合开始时，你可以令任意名除其以外的角色选择是否蓄谋。" +
		"当一名角色受到伤害后，你观看其蓄谋牌并展示其中一张，选择一项：" +
		"对伤害来源使用之（无距离限制）；令其获得之。",
	voices: [
		"舍身护主，扬吴将之风！",
		"袭军挫阵，奋江东之威！",
	],
	skill: {
		round: 1,
		trigger: { global: "phaseBegin" },
		async cost(event, trigger, player) {
			event.result = await player.chooseTarget({
				prompt: "奋威：你可以令任意名非当前回合角色选择是否蓄谋",
				selectTarget: [1, Infinity],
				filterTarget(card, player, target) {
					return target != _status.currentPhase &&
						target.countCards("h") > 0 &&
						!target.isDisabledJudge();
				},
			}).forResult();
		},
		async content(event, trigger, player) {
			for (const target of event.targets.sortBySeat(_status.currentPhase)) {
				if (target.countCards("h") > 0 && !target.isDisabledJudge()) {
					/** @type {Result} */
					const result = await target.chooseCard({
						prompt: "奋威：你可以蓄谋",
						ai(card) {
							if (get.attitude(target, player) <= 0)
								return 0;
							let eff = target.getUseValue(card);
							if (card.name == "sha")
								eff += 10;
							return eff;
						},
					}).forResult();
					if (result.bool) {
						await target.addJudge(
							//@ts-expect-error 可以这样
							{ name: "xumou_jsrg" },
							result.cards,
						);
					}
				}
			}
		},
		group: "zm_fenwei_damage",
		subSkill: {
			damage: {
				audio: "zm_fenwei",
				forced: true,
				locked: false,
				trigger: { global: "damageEnd" },
				filter(event, player, name, target) {
					//@ts-expect-error card.viewAs can be used here
					return event.player.countCards("j", card => (card.viewAs || card.name) == "xumou_jsrg") > 0;
				},
				async content(event, trigger, player) {
					const to = trigger.player;
					//@ts-expect-error `card.viewAs` can be used here
					const xumou1 = to.getCards("j", card => (card.viewAs || card.name) == "xumou_jsrg");
					//@ts-expect-error `.cards` can be used here
					const xumou2 = xumou1.map(x => x.cards).flat();

					/** @type {Result} */
					const result1 = await player.chooseButton({
						forced: true,
						createDialog: [
							`奋威：请展示${get.translation(to)}的一张蓄谋牌`,
							xumou2,
						],
						ai(button) {
							/** @type {Card} */
							const card = button.link;
							if (xumou2.every(x => {
								return !player.canUse(x, trigger.source, false) ||
									get.effect(trigger.source, x, player, player) <= 0;
							})) {
								let ret = get.useful(card, to);
								if (get.attitude(player, to) <= 0)
									ret = -ret;
								return ret;
							}
							if (!player.canUse(card, trigger.source, false))
								return 0;
							return get.effect(trigger.source, card, player, player);
						},
					}).forResult();

					/** @type {Card} */
					const card = result1.buttons[0].link;
					await player.showCards(card);

					let use = false;
					if (trigger.source && player.canUse(card, trigger.source, false)) {
						/** @type {Result} */
						const result2 = await player.chooseBool({
							prompt:
								`奋威：你可以对${get.translation(trigger.source)}` +
								`使用${get.translation(card)}，或点“取消”令` +
								`${get.translation(to)}获得此牌`,
							choice: get.effect(trigger.source, card, player, player) > 0,
						}).forResult();
						use = result2.bool || false;
					}
					if (use) {
						await player.useCard({
							card,
							targets: [trigger.source],
						});
					} else {
						await to.gain({
							//@ts-expect-error `.cards` can be used here
							cards: xumou1.filter(x => x.cards[0].name == card.name),
							animate: "gain2",
						});
					}
				},
			},
		},
	},
});
