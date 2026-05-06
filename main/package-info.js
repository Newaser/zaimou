import { URL } from "../utils/constants.js";
import { lib } from "../../../noname.js";

/** @type {importExtensionConfig['package']} */
export const packageInfo = {};

const info = await lib.init.promises.json(URL.PACKAGE_INFO);

packageInfo.author = `<span class="bluetext">${info.author}</span>`;
packageInfo.version = info.version;

let groupIdOnClick = `
navigator.clipboard.writeText(${info.groupId})
	.then(function () {
		alert('群号复制成功');
	})
	.catch(function (error) {
		alert(\`复制失败：\${error}\`);
	});
`;
groupIdOnClick = groupIdOnClick.replace(/\s*\n\s*/g, "");

packageInfo.intro = `
<style>
	.clickable {
		cursor: pointer;
	}
</style>
<span style="text-align: center;">
  <h2 style="color: #def7ca;">
    谋攻未尽，再启风云。
  </h2>
  <h4 style="color: cyan;">
    扩展交流群：
	<u class="clickable" onclick="${groupIdOnClick}", title="复制群号">
		${info.groupId}
	</u>
  </h4>
</span>
<hr>
<h3 style="text-align: center;">版本信息</h3>
<p>
  扩展版本：v${info.version}
  <br>更新日期：${info.lastUpdated}
  <br>支持的无名杀最低版本：v${info.minNoname}
  ${info.adaptedExts.length > 0 ?
		`<br>适配的其他扩展：${info.adaptedExts.join("、")}` : ""}
</p>
<hr>
<h3 style="text-align: center;">设置</h3>
`;
