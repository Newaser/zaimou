import * as util from "../../../utils/util.js";
import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

export default new SkillData("zm_fuye|辅业", {
	description:
		"<b>使命技</b>，你的登场势力为魏。①使命：其他角色受到伤害后，若伤害来源不为你或其，" +
		`其可以交给你一张牌，令来源对你造成1点${get.poptip("virtual_damage")}。` +
		"②失败：结束阶段，若本局游戏你于回合外获得过至少四张牌，你获得" +
		`${get.poptip("zm_zhengbian")}并休整一轮。`,
	voices: [
		"辅国臣之本分，何敢图于禄勋。",
		"吾之心意？哈哈哈，自是辅国弼朝。",
		"告成归老，待罪武阳。",
	],
	texts: {
		"(poptip)virtual_damage|虚拟伤害":
			"一种伤害类型，此类型的伤害不会对受伤角色的体力值产生实际影响。",
	},
	skill: {
		logAudio: util.logSkillAudio("zm_fuye", [1, 2]),
		dutySkill: true,
		initGroup: "wei",
		trigger: {
			global: "damageEnd",
		},
		filter(event, player, name, target) {
			return event.num > 0 &&
				event.player != player &&
				event.source &&
				event.source != player &&
				event.source != event.player &&
				event.player.countCards("he") > 0;
		},
		async cost(event, trigger, player) {
			event.result = await trigger.player.chooseCard({
				prompt: get.prompt("zm_fuye"),
				prompt2:
					`交给${get.translation(player)}一张牌，` +
					`令${get.translation(trigger.source)}对其造成1点虚拟伤害`,
				ai(card) {
					const src = trigger.source, dest = trigger.player;
					const
						cardValue2Dest = get.value(card, dest),
						cardValue2Me = get.value(card, player),
						attDest2Src = get.attitude(dest, src),
						attDest2Me = get.attitude(dest, player),
						srcGainable = src.countGainableCards(player, "he"),
						aboutToFail = player.countMark("zm_fuye_mark") == 3;
					if (attDest2Src > 0) {
						return -1;
					}
					if (attDest2Me > 0) {
						if (!srcGainable)
							return cardValue2Me - cardValue2Dest;
						return Infinity - cardValue2Dest;
					} else if (attDest2Me == 0) {
						if (aboutToFail || !srcGainable)
							return -1;
						return 4.5 - cardValue2Dest;
					}
					return -1;
				},
			}).forResult();
		},
		async content(event, trigger, player) {
			await trigger.player.give(event.cards, player);
			await player.damage({
				source: trigger.source,
				unreal: true,
			});
		},
		group: ["zm_fuye_fail", "zm_fuye_counter"],
		subSkill: {
			fail: {
				logAudio: util.logSkillAudio("zm_fuye", 3),
				forced: true,
				locked: false,
				trigger: {
					player: "phaseJieshu",
				},
				filter(event, player, name, target) {
					return player.countMark("zm_fuye_mark") == 4;
				},
				async content(event, trigger, player) {
					player.awakenSkill("zm_fuye");
					player.removeSkill("zm_fuye_mark");
					player.removeSkill("zm_fuye_counter");
					game.log(player, "的使命", "#g辅政", "失败");

					player.addSkill("zm_zhengbian");
					player.rest({ type: "round", count: 1 });
				},
			},
			counter: {
				charlotte: true,
				direct: true,
				trigger: {
					player: "gainAfter",
					global: "loseAsyncAfter",
				},
				filter(event, player, name, target) {
					return player != _status.currentPhase &&
						event.getg(player).length > 0 &&
						player.countMark("zm_fuye_mark") < 4;
				},
				async content(event, trigger, player) {
					const a = player.countMark("zm_fuye_mark");
					const b = trigger.getg(player).length;
					player.setMark("zm_fuye_mark", Math.min(a + b, 4), false);
				},
			},
			mark: {
				mark: true,
				intro: { content: "本局游戏已于回合外获得过#张牌" },
			},
		},
		derivation: ["zm_zhengbian", "mbdangyi", "lianpo"],
	},
});
