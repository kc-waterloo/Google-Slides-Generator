/**
 * setup.ts
 *
 * Created by Min-Kyu Lee on 02-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import * as fs from "fs"; 

if (!fs.existsSync("./dist")) {
	fs.mkdirSync("./dist");
}
fs.copyFileSync("./assets/appsscript.json", "./dist/appsscript.json");
