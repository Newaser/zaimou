import { CharacterPackage } from "../utils/import.js";

import zhi from "./zhi/index.js";
import shi from "./shi/index.js";
import tong from "./tong/index.js";
import yu from "./yu/index.js";
import neng from "./neng/index.js";

const pkg = new CharacterPackage();

pkg.addSubpackages([
	zhi,
	shi,
	tong,
	yu,
	neng,
]);

export default pkg;
