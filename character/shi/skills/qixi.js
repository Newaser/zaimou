import { SkillData } from "../../../utils/import.js";
import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";
import { fenweiCheckRestore } from "./fenwei.js";

/**
 * 获取一些牌中所有装备牌对应的装备栏集合
 * @param {Card[]} cards 
 * @param {boolean} [translate=false] 是否翻译装备栏名
 * @returns {string[]}
 */
function getEquipSlots(cards, translate = false) {
	let subtypes = [];
	cards.forEach(i => {
		const subtype = get.subtype(i);
		if (get.type(i) == "equip" && subtype)
			return subtypes.add(subtype);
	});
	if (translate) subtypes = subtypes.map(i => `${get.translation(i)}栏`);
	return subtypes;
}

const BR = "<br>&nbsp;&nbsp;&nbsp;&nbsp;";

export default new SkillData("zm_qixi|奇袭", {
	description:
		"你可以将一张黑色牌当【过河拆桥】使用。当你弃置一名角色的一个区域内最后的牌时，可以执行对应效果：" +
		`${BR}手牌区，对该角色造成1点伤害；` +
		`${BR}装备区，废除此区域内这些牌对应的装备栏；` +
		`${BR}判定区，废除之。`,
	voices: [
		"击敌不备，奇袭拔寨！",
		"轻羽透重铠，奇袭溃坚城！",
	],
	skill: {
		enable: "chooseToUse",
		viewAs: { name: "guohe" },
		viewAsFilter(player) {
			if (!player.countCards("hes", { color: "black" })) {
				return false;
			}
		},
		filterCard(card, player) {
			return get.color(card, player) == "black";
		},
		position: "hes",
		prompt: "将一张黑色牌当过河拆桥使用",
		/**
		 * @type {(card: Card) => number | boolean | void}
		 */
		check(card) {
			return 4 - get.value(card);
		},
		group: "zm_qixi_discard",
		subSkill: {
			discard: {
				audio: "zm_qixi",
				trigger: { global: ["loseAfter", "loseAsyncAfter"] },
				filter(event, player, name, target) {
					const to = event.player;
					return event.type == "discard" &&
						to.isIn() &&
						event.discarder == player &&
						[..."hej"].some(i =>
							event.getl(to)[`${i}s`].length > 0 &&
							to.countCards(i) == 0,
						);
				},
				async cost(event, trigger, player) {
					const
						to = trigger.player,
						areas = [..."hej"].filter(i =>
							trigger.getl(to)[`${i}s`].length > 0 &&
							to.countCards(i) == 0,
						),
						effectMap = {
							"h": "对其造成1点伤害",
							"e": `废除其${getEquipSlots(trigger.getl(to).es, true).join("、")}`,
							"j": "废除其判定区",
						},
						aiMap = {
							"h": () => get.damageEffect(to, player, player) > 0,
							"e": () => get.attitude(player, to) <= 0,
							"j": () => {
								let ret = get.attitude(player, to) > 0;
								if (to.hasSkill("xinfu_limu")) ret = !ret;
								return ret;
							},
						};

					if (areas.length == 1) {
						const area = areas[0];
						/** @type {Result} */
						const result = await player.chooseBool({
							prompt: get.prompt("zm_qixi", to),
							prompt2: effectMap[area],
							choice: aiMap[area],
						}).forResult();
						if (result.bool) {
							event.result = {
								bool: true,
								targets: [to],
								cost_data: { areas },
							};
						}
					} else {
						/** @type {Result} */
						const result = await player.chooseButton({
							createDialog: [
								`奇袭：你可以对${get.translation(to)}执行任意项`,
								[areas.map(i => [i, effectMap[i]]), "textbutton"],
							],
							selectButton: [1, areas.length],
							ai(button) {
								return Number(aiMap[button]);
							},
						}).forResult();
						if (result.bool) {
							event.result = {
								bool: true,
								targets: [to],
								cost_data: { areas: result.links },
							};
						}
					}
				},
				async content(event, trigger, player) {
					const
						to = trigger.player,
						/** @type {string[]} */
						areas = event.cost_data.areas;
					for (const area of areas) {
						if (area == "h") {
							await to.damage();
						} else if (area == "e") {
							await to.disableEquip({ slots: getEquipSlots(trigger.getl(to).es), source: player });
						} else {
							await to.disableJudge();
						}
						// “奋威”相关
						fenweiCheckRestore(area, event, player);
					}
				},
			},
		},
	},
});

export const qixi_test1 = new SkillData("zm_qixi_test1|全弃", {
	description: "出牌阶段，弃置一名角色区域内的所有牌。",
	skill: {
		enable: "phaseUse",
		filterTarget: true,
		async content(event, trigger, player) {
			event.target.discard({
				cards: event.target.getCards("hej"),
				discarder: player,
			});
		},
		prompt: "弃置一名角色区域内所有牌",
	},
});
