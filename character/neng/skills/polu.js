import * as util from "../../../utils/util.js";
import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

export default new SkillData("zm_polu|破虏", {
	description:
		"出牌阶段限一次，你可以失去1点体力并弃置一名其他角色的两张牌：" +
		"若其中包含【杀】，你获得这些【杀】，本阶段你对其使用牌无距离与次数限制；" +
		"否则，你获得1点护甲。",
	voices: [
		"传令所部兵马，定绝董贼后路！",
		"诸将休整既毕，且随我跨江击贼！",
		"逐贼至此，必诛之方后快！",
		"众位兄弟，敌寇未尽，不可放松！",
	],
	skill: {
		logAudio: util.logSkillAudio("zm_polu", [1, 2]),
		enable: "phaseUse",
		usable: 1,
		filter(event, player, name, target) {
			return player.hp > 0 && game.hasPlayer(p =>
				p != player &&
				p.countCards("he") > 0,
			);
		},
		filterTarget(card, player, target) {
			return target != player &&
				target.countCards("he") > 0;
		},
		async content(event, trigger, player) {
			const to = event.target;
			await player.loseHp();
			/** @type {Result} */
			const result = await player.discardPlayerCard({
				target: to,
				position: "he",
				forced: true,
				selectButton: 2,
			}).forResult();
			await game.delay();

			const shas = result.cards.filter(c => c.name == "sha");
			if (shas.length > 0) {
				util.playSkillAudio("zm_polu", 3, false, player);
				await player.gain({
					cards: shas.filterInD("d"),
					source: to,
					animate: "gain2",
				});
				const expire = { global: ["phaseAnyAfter", "phaseAfter"] };
				to.addTempSkill("zm_polu_mark", expire);
				to.storage.zm_polu_mark = player;
				to.markAuto("zm_polu_mark");
			} else if (player.hujia < 5) {
				util.playSkillAudio("zm_polu", 4, false, player);
				await player.changeHujia(1, "gain", 5);
			}
		},
		mod: {
			targetInRange(card, player, target, result) {
				if (target.storage.zm_polu_mark == player) {
					return true;
				}
			},
			cardUsableTarget(card, player, target, result) {
				if (target.storage.zm_polu_mark == player) {
					return true;
				}
			},
		},
		subSkill: {
			mark: {
				onremove: true,
				intro: { content: "本阶段$对该角色使用牌无距离与次数限制" },
			},
		},
		ai: {
			order: 9.1,
			result: {
				target(player, target, card) {
					const saveNum = player.countCards("hs", c => get.tag(c, "save"));
					if (player.hp + saveNum <= 1) return;
					return -2;
				},
			},
		},
	},
});
