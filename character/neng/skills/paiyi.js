import * as util from "../../../utils/util.js";
import { URL } from "../../../utils/constants.js";
import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

const wuzhong = { name: "wuzhong", isCard: true };

/**
 * @param {Player} player 
 * @returns {number}
 */
function getUsedTimes(player) {
	return player.storage.zm_paiyi_used || 0;
}

/**
 * @param {Player} player 
 */
function addUsedTimes(player) {
	player.addTempSkill("zm_paiyi_used", "roundStart");
	player.storage.zm_paiyi_used++;
}

/**
 * @param {Player} player 
 * @returns {number}
 */
function getX(player) {
	// return player.storage.zm_paiyi_record;
	return 1;
}

export default new SkillData("zm_paiyi|排异", {
	description: "每轮限两次，一名角色的回合结束时，你可以视为对其使用一张【无中生有】，然后其受到X点无来源伤害（X为本回合其因牌而获得牌的次数）。",
	voices: [
		"总有子房之谋，亦难逃谗言中伤！",
		"此皆怀异之徒，安能为我所容！",
		"剑阁虽有小损，亦为我砺策之机！",
		"为成帝王之业，何忌些许反名！",
	],
	skill: {
		/** @type {import("../../../utils/type.ts").LogAudioFunc} */
		logAudio(event, player, name, indexedData, result) {
			let idx = [1, 2].randomGet();
			if (_status.currentPhase == player) idx += 2;
			return `${URL.SKILL_AUDIO}/zm_zili${idx}.mp3`;
		},
		trigger: { global: "phaseEnd" },
		filter(event, player, name, indexedData) {
			return getUsedTimes(player) < 2;
		},
		logTarget: () => _status.currentPhase,
		check(event, player, triggername, indexedData) {
			// TODO
			return true;
		},
		async content(event, trigger, player) {
			addUsedTimes(player);
			await player.useCard({
				// @ts-expect-error card可以这样取值
				card: wuzhong,
				targets: [_status.currentPhase],
			});
			const x = getX(player);
			await _status.currentPhase.damage({ num: x, nosource: true });
		},
		group: "zm_paiyi_record",
		subSkill: {
			record: {
				charlotte: true,
				direct: true,
				init(player, skill) {
					player.setStorage(skill, 0);
				},
				trigger: {
					global: ["gainAfter", "loseAsyncAfter", "phaseAfter"],
				},
				filter(event, player, name, indexedData) {
					return name == "phaseAfter" ||
						event.getg(_status.currentPhase).length > 0;
				},
				async content(event, trigger, player) {
					if (trigger.triggername == "phaseAfter") {
						player.setStorage(event.name, 0);
					} else {
						player.storage[event.name]++;
					}
				},
			},
			used: {
				init(player, skill) {
					player.setStorage(skill, 0);
				},
				onremove: true,
			},
		},
	},
});
