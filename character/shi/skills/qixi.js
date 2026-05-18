import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

export default new SkillData("zm_qixi|奇袭", {
	description:
		`当你使用【杀】时，你可以为此【杀】秘密添加一个${get.poptip("zm_qixi_effects")}（回合外添加的效果翻倍）。`,
	voices: [
		"击敌不备，奇袭拔寨！",
		"轻羽透重铠，奇袭溃坚城！",
	],
	texts: {
		"(poptip)zm_qixi_effects|“奇袭”效果":
			"<b>神箭射却</b>：造成的伤害+1。" +
			"<br><b>百骑劫营</b>：被目标角色使用的【闪】抵消时，你获得其一张牌。",
	},
	skill: {
		trigger: { player: "useCard" },
		filter(event, player, name, target) {
			return event.card.name == "sha";
		},
		async cost(event, trigger, player) {
			const num = _status.currentPhase == player ? 1 : 2;
			/** @type {Result} */
			const result = await player.chooseControlList({
				prompt:
					`###${get.prompt("zm_qixi")}###` +
					"为此【杀】添加一个“奇袭”效果",
				list: [
					`（神箭射却）造成的伤害+${num}`,
					`（百骑劫营）被目标角色使用的【闪】抵消时，你获得其${get.cnNumber(num)}张牌`,
				],
				ai(event, player) {
					if (event.targets.every(p => get.attitude(player, p) > 0)) {
						return "cancel2";
					}
					let zeroIsBetter = 0;
					let oneIsBetter = 0;
					for (const target of event.targets) {
						if (target.mayHaveShan(player, "use") == (get.attitude(player, target) > 0)) {
							zeroIsBetter++;
						} else {
							oneIsBetter++;
						}
					}
					if (zeroIsBetter >= oneIsBetter) {
						return 0;
					}
					return 1;
				},
			}).forResult();
			if (result.control != "cancel2") {
				event.result = {
					bool: true,
					cost_data: { index: result.index },
				};
			}
		},
		async content(event, trigger, player) {
			trigger.card.storage.zm_qixi = [event.cost_data.index, false];
		},
		group: ["zm_qixi_sharpen", "zm_qixi_steal"],
		subSkill: {
			sharpen: {
				charlotte: true,
				direct: true,
				trigger: { source: "damageBegin1" },
				filter(event, player, name, target) {
					return event.card?.storage?.zm_qixi?.[0] == 0;
				},
				async content(event, trigger, player) {
					trigger.card.storage.zm_qixi[1] = true;
					trigger.num += _status.currentPhase == player ? 1 : 2;
				},
			},
			steal: {
				charlotte: true,
				direct: true,
				trigger: { player: "shaMiss" },
				filter(event, player, name, target) {
					return event.card.storage?.zm_qixi?.[0] == 1;
				},
				async content(event, trigger, player) {
					trigger.card.storage.zm_qixi[1] = true;
					const num = _status.currentPhase == player ? 1 : 2;
					await player.gainPlayerCard({
						prompt: `奇袭：选择获得${get.translation(trigger.player)}的${get.cnNumber(num)}张牌`,
						forced: true,
						target: trigger.target,
						position: "he",
						selectButton: num,
					});
				},
			},
		},
		ai: {
			damageBonus: true,
		},
	},
});
