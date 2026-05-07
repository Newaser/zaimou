import * as util from "../../../utils/util.js";
import { URL } from "../../../utils/constants.js";
import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

export default new SkillData("zm_hanzhan|酣战", {
	description:
		"<b>蓄力技（3/6）</b>，当你一次获得至少两张牌后，你获得1点蓄力点。" +
		"你可以消耗3点蓄力点，视为使用一张【决斗】。每名角色首次打出" +
		"【杀】响应此【决斗】时，其摸三张牌。",
	voices: [
		"君壮情烈胆，某必当奉陪！",
		"哼，汝还能战否？",
		"哼，你我再斗一番，方知孰为霸王！",
		"待吾重振兵马，胜负犹未可知！",
	],
	skill: {
		logAudio: util.logSkillAudio("zm_hanzhan", 1),
		chargeSkill: 6,
		init(player, string) {
			game.addGlobalSkill("zm_hanzhan_global");
			player.addCharge(3, false);
		},
		onremove(player, type) {
			game.players.concat(game.dead)
				.forEach(i => game.removeGlobalSkill("zm_hanzhan_global", i));
		},
		enable: "chooseToUse",
		filter(event, player, name, target) {
			return player.countCharge() >= 3;
		},
		viewAs: {
			name: "juedou",
			isCard: true,
		},
		filterCard: (card, player) => false,
		selectCard: -1,
		async precontent(event, trigger, player) {
			player.removeCharge(3);
		},
		onuse(result, player) {
			//@ts-expect-error 可以card.storage
			result.card.storage = { zm_hanzhan: [] };
		},
		prompt: "消耗3蓄力视为使用【决斗】。每名角色首次出【杀】响应此【决斗】时，其摸三张牌。",
		ai: {
			order(item, player) {
				return get.order({ name: "juedou" }) + 0.5;
			},
			effect: {
				player(card, player, target, result1) {
					if (!card.storage?.zm_hanzhan)
						return;
					let
						probP = player.mayHaveSha(player, "respond", null, "odds"),
						probT = target.mayHaveSha(player, "respond", null, "odds");
					probP = Number(probP); probT = Number(probT);
					return [1, probP * 3, 1, probT * 3];
				},
			},
		},
		group: ["zm_hanzhan_recharge", "zm_hanzhan_respond"],
		subSkill: {
			recharge: {
				direct: true,
				trigger: {
					player: "gainAfter",
					global: "loseAsyncAfter",
				},
				filter(event, player, name, target) {
					return event.getg(player).length >= 2 &&
						player.countCharge(true) > 0;
				},
				async content(event, trigger, player) {
					player.addCharge();
				},
			},
			respond: {
				/** @type {import("../../../utils/type.ts").LogAudioFunc} */
				logAudio(event, player, name, indexedData, result) {
					let idx = 2;
					if (event.player == player) {
						idx = [3, 4].randomGet();
					}
					return `${URL.SKILL_AUDIO}/zm_hanzhan${idx}.mp3`;
				},
				forced: true,
				locked: false,
				trigger: {
					global: "respond",
				},
				filter(event, player, name, target) {
					const cardStorage =
						event.respondTo?.[1].storage?.zm_hanzhan;
					return event.card.name == "sha" &&
						cardStorage && !cardStorage.includes(event.player);
				},
				async content(event, trigger, player) {
					const to = trigger.player;
					to.draw(3);
					trigger.respondTo[1].storage.zm_hanzhan.push(to);
				},
			},
			global: {
				ai: {
					useSha: "respond",
					skillTagFilter(player, tag, arg) {
						const cardStorage = get.event().card.storage?.zm_hanzhan;
						return cardStorage && !cardStorage.includes(player);
					},
				},
			},
		},
	},
});
