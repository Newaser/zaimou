import { URL } from "../../../utils/constants.js";
import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

export default new SkillData("zm_danshou|胆守", {
	description:
		"每名角色的结束阶段，若本回合你使用或打出的牌数与你成为牌目标的次数相比：" +
		"相等，你摸等量的牌（至少摸一张）；<b>前</b>/<b>后</b>者较大，" +
		"你可以弃置X张牌（X为两者差值），<b>令一名非当前回合角色回复1点体力</b>/" +
		"<b>对当前回合角色造成1点伤害</b>。",
	voices: [
		"此城危难，我必当竭尽全力！",
		"如今之势，莫如以守代攻！",
		"敌军兵疲马乏，正是出击之时！",
	],
	skill: {
		/** @type {import("../../../utils/type.ts").LogAudioFunc} */
		logAudio(event, player, name, indexedData, result) {
			const
				idxMap = {
					"draw": 1,
					"recover": 2,
					"damage": 3,
				},
				idx = idxMap[result?.cost_data.type];
			return `${URL.SKILL_AUDIO}/zm_danshou${idx}.mp3`;
		},
		trigger: {
			global: "phaseJieshu",
		},
		filter(event, player, name, target) {
			const a = player.countMark("zm_danshou_played");
			const b = player.countMark("zm_danshou_targeted");

			if (a == b) return true;

			const x = Math.abs(a - b);
			if (player.countCards("he") < x) return false;

			return a > b ?
				game.hasPlayer(p => p != _status.currentPhase && p.isDamaged()) :
				true;
		},
		async cost(event, trigger, player) {
			const
				a = player.countMark("zm_danshou_played"),
				b = player.countMark("zm_danshou_targeted"),
				x = Math.abs(a - b);
			if (a == b) {
				event.result = {
					bool: true,
					cost_data: {
						type: "draw",
						num: Math.max(a, 1),
					},
				};
			} else if (a > b) {
				event.result = await player.chooseCardTarget({
					prompt: get.prompt("zm_danshou"),
					prompt2: `弃置${x}张牌，令一名非当前回合角色回复1点体力`,
					filterCard(card, player, event) {
						return lib.filter.cardDiscardable(card, player, event?.name);
					},
					selectCard: x,
					position: "he",
					filterTarget(card, player, target) {
						return target != _status.currentPhase &&
							target.isDamaged();
					},
					ai1(card) {
						return 7 - get.value(card, player);
					},
					ai2(target) {
						return get.recoverEffect(target, player, player);
					},
				}).forResult();
				event.result.cost_data = { type: "recover" };
			} else {
				event.result = await player.chooseCard({
					prompt: get.prompt("zm_danshou", _status.currentPhase),
					prompt2: `弃置${x}张牌，对其造成1点伤害`,
					filterCard(card, player, event) {
						return lib.filter.cardDiscardable(card, player, event?.name);
					},
					selectCard: x,
					position: "he",
					ai(card) {
						if (get.damageEffect(_status.currentPhase, player, player) <= 0)
							return -1;
						return 7 - get.value(card, player);
					},
				}).forResult();
				event.result.targets = [_status.currentPhase];
				event.result.cost_data = { type: "damage" };
			}
		},
		async content(event, trigger, player) {
			const cost_data = event.cost_data;
			if (cost_data.type == "draw") {
				await player.draw(cost_data.num);
			} else if (cost_data.type == "recover") {
				await player.discard({ cards: event.cards });
				await event.targets[0].recover();
			} else {
				await player.discard({ cards: event.cards });
				await _status.currentPhase.damage();
			}
		},
		group: [
			"zm_danshou_played",
			"zm_danshou_targeted",
			"zm_danshou_reset",
		],
		subSkill: {
			played: {
				charlotte: true,
				direct: true,
				marktext: "使用打出",
				intro: { content: "本回合你使用或打出过#张牌" },
				trigger: {
					player: ["useCard", "respond"],
				},
				async content(event, trigger, player) {
					player.addMark(event.name, 1, false);
				},
			},
			targeted: {
				charlotte: true,
				direct: true,
				marktext: "成为目标",
				intro: { content: "本回合你成为过#次牌的目标" },
				trigger: {
					target: "useCardToTargeted",
				},
				async content(event, trigger, player) {
					player.addMark(event.name, 1, false);
				},
			},
			reset: {
				charlotte: true,
				direct: true,
				trigger: {
					global: "phaseAfter",
				},
				async content(event, trigger, player) {
					player.clearMark("zm_danshou_played", false);
					player.clearMark("zm_danshou_targeted", false);
				},
			},
		},
	},
});
