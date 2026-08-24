/**
 * logger.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

type LogLevel = "INFO" | "WARN" | "ERROR";

const LOG_LEVEL_PAD = 5;

const log_ = (level: LogLevel, module: string, message: string): void => {
	const timestamp = new Date().toISOString();
	const padded = `[${level}]`.padEnd(LOG_LEVEL_PAD + 2);
	console.log(`${timestamp} ${padded} [${module}] ${message}`);
};

export const logInfo = (module: string, message: string): void => {
	log_("INFO", module, message);
};

export const logWarn = (module: string, message: string): void => {
	log_("WARN", module, message);
};

export const logError = (module: string, message: string): void => {
	log_("ERROR", module, message);
};
