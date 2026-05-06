import { Character } from "../../../noname/library/element/index.js";
import { ChooseBase, CheckCardTargetParams } from "@/library/element/Player/type.d";

/** 武将评级 */
export type Rank = "s" | "ap" | "a" | "am" | "bp" | "b" | "bm" | "c" | "d";

/** 
 * **武将稀有度**
 * 
 * 与其他属性的对应关系：
 * 
 * | 稀有度   | 龙的样式    | 标签     |从夯到拉   |
 * |----------|------------|----------|----------|
 * | `legend` | 炎龙       | 传说     | 夯        |
 * | `epic`   | 玉龙       | 史诗     | 顶级      |
 * | `rare`   | 金龙       | 稀有     | 人上人    |
 * | `common` | 银龙       | 精良     | 拉完了    |
 * | `junk`   | 无龙       | 精品     | NPC       |
 */
export type Rarity = "legend" | "epic" | "rare" | "common" | "junk";

/**
 * **武将信息**
 * 
 * 包含武将的基本信息、介绍、称号、评级、稀有度、台词等。 
 */
export interface CharacterInfo {
	/**
	 * 武将基本信息
	 */
	basic: Character;
	/**
	 * 武将介绍
	 */
	intro?: string;
	/**
	 * 武将称号
	 */
	title?: string;
	/**
	 * 阵亡台词
	 */
	dieVoice?: string;
	/**
	 * 胜利台词
	 */
	victoryVoice?: string;
	/**
	 * 武将评级
	 */
	rank?: Rank;
	/**
	 * 稀有度
	 */
	rarity?: Rarity;
	/** ## 技能语音重定向
	 * 
	 * ---
	 * 
	 * ### 基本格式：
	 * ```javascript
	 * audioRedirect: {
	 *   "已有技能的id": [ "台词1", "台词2", ... ],
	 *   ...
	 * },
	 * ```
	 * 
	 * 对应地，相应的音频文件应命名为：
	 * 
	 * - `<已有技能的id>__<武将id>1.mp3`
	 * - `<已有技能的id>__<武将id>2.mp3`
	 * - `...`
	 * 
	 * 放在扩展的技能语音目录下。
	 * 
	 * ---
	 * 
	 * ### 高级格式：
	 * 
	 * 可以将多个技能或子技能重定向至同一组台词，格式为：
	 * ```javascript
	 * audioRedirect: {
	 *   "<skillId1>|<skillId2>:<subSkillId>": [ "台词1", "台词2", ... ],
	 *   ...
	 * },
	 * ```
	 * 
	 * 至于音频文件的名称，应以其中**首个技能**的名称为前缀，为：
	 * 
	 * - `<skillId1>__<武将id>1.mp3`
	 * - `<skillId1>__<武将id>2.mp3`
	 * - `...`
	 * 
	 * ---
	 * 
	 * ### 案例1
	 * 
	 * 以武将 `spr_guanyu` 举例，若其有如下值：
	 * 
	 * ```javascript
	 * audioRedirect: {
	 *   "wusheng": [
	 *     "可知关某之威！",
	 *     "关某既出，敌将定皆披靡！",
	 *   ],
	 * },
	 * ```
	 * 
	 * 则相应的音频文件应命名为：
	 * - `wusheng__spr_guanyu1.mp3`
	 * - `wusheng__spr_guanyu2.mp3`
	 * 
	 * ---
	 * 
	 * ### 案例2
	 * 
	 * 以武将 `spr_zhaoyun` 举例，若其有如下值：
	 * 
	 * ```javascript
	 * audioRedirect: {
	 *   "longdan:sha|longdan:shan|longdan": [
	 *     "云虽无名，亦不怯尔等半分！",
	 *     "少年何惧千军阵，银枪龙胆鉴丹心！",
	 *   ],
	 * },
	 * ```
	 * 
	 * 则 `spr_zhaoyun` 的技能 `longdan_sha`、`longdan_shan`、`longdan` 
	 * （前两个为子技能）均会被重定向，且只需要两个音频文件，应命名为：
	 * - `longdan_sha__spr_zhaoyun1.mp3`
	 * - `longdan_sha__spr_zhaoyun2.mp3`
	 */
	audioRedirect?: Record<string, string[]>;
	/**
	 * 武将包含的其他文本信息
	 */
	texts?: Record<string, string>;
	/**
	 * 将在扩展包的 `precontent()` 里运行内容
	 * @param data 武将数据自身
	 */
	runtime1?: (data: CharacterInfo) => any;
	/**
	 * 将在扩展包的 `content()` 里运行内容
	 * @param data 武将数据自身
	 */
	runtime2?: (data: CharacterInfo) => any;
	/**
	 * 是否禁止自动绑定至同名武将替换序列。默认不禁止
	 */
	disableAutoReplace?: boolean;
}

/**
 * **技能信息**
 * 
 * 包含技能的名称、代码、描述、台词等。
 */
export interface SkillInfo {
	/**
	 * 技能代码
	 */
	skill: Skill;
	/**
	 * 技能描述
	 */
	description?: string;
	/**
	 * 技能描述动态翻译函数
	 * @param player 技能拥有者
	 * @param desc 原始描述
	 * @returns 动态翻译后的描述，若不返回则为原描述
	 */
	dynamicDescription?: (player: Player, desc: string) => string | undefined;
	/**
	 * 技能台词
	 */
	voices?: string[];
	/**
	 * 技能包含的其他文本信息
	 */
	texts?: Record<string, string>;
	/**
	 * 将在扩展包的 `precontent()` 里运行内容
	 * @param data 技能数据自身
	 */
	runtime1?: (data: SkillInfo) => any;
	/**
	 * 将在扩展包的 `content()` 里运行内容
	 * @param data 技能数据自身
	 */
	runtime2?: (data: SkillInfo) => any;
	/**
	 * 是否禁止自动生成技能语音与台词（适用于格式化导入）。默认不禁止
	 */
	disableAutoAudio?: boolean;
}

type AudioInfo = AudioInfo[] | string | number | boolean;

/**
 * 音频播放函数
 * @param event 当前事件或触发事件
 * @param player 
 * @param name triggername
 * @param indexedData trigger times的索引
 * @param result cost事件的result
 */
export type LogAudioFunc = (
	event: GameEvent,
	player: Player,
	name?: string,
	indexedData?: number,
	result?: Result
) => AudioInfo;

/**
 * `wuxie()` 方法，在SKillAI里使用
 * @param target 
 * @param card 
 * @param player 
 * @param  viewer 
 * @param  status 
 */
export type AIwuxieFunc = (
	target: Player,
	card: Card,
	player: Player,
	viewer: Player,
	status: number,
) => number | void;

/**
 * `chooseCardTarget()` 里的 `oncard()` 方法
 */
export type OnCardFunc = (card: Card, player: Player) => any;

export interface UtilChooseToViewAsParams extends ChooseBase, CheckCardTargetParams {
	viewAs: Skill["viewAs"];
	viewAsFilter?: Skill["viewAsFilter"];
	onuse?: Skill["onuse"];
}
