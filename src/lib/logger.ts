import chalk from "chalk";

export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3,
	SILENT = 4,
}

export interface LoggerOptions {
	level: LogLevel;
	prefix?: string;
	timestamp?: boolean;
	colors?: boolean;
}

export class Logger {
	private level: LogLevel;
	private prefix: string;
	private timestamp: boolean;
	private colors: boolean;

	constructor(options: Partial<LoggerOptions> = {}) {
		this.level = options.level ?? LogLevel.INFO;
		this.prefix = options.prefix ?? "";
		this.timestamp = options.timestamp ?? true;
		this.colors = options.colors ?? true;
	}

	private formatMessage(
		level: string,
		message: string,
		...args: unknown[]
	): string {
		const parts: string[] = [];

		if (this.timestamp) {
			const now = new Date().toISOString();
			parts.push(this.colors ? chalk.gray(`[${now}]`) : `[${now}]`);
		}

		if (this.prefix) {
			parts.push(
				this.colors ? chalk.cyan(`[${this.prefix}]`) : `[${this.prefix}]`,
			);
		}

		parts.push(level);
		parts.push(message);

		return (
			parts.join(" ") +
			(args.length > 0
				? ` ${args
						.map((arg) =>
							typeof arg === "object"
								? JSON.stringify(arg, null, 2)
								: String(arg),
						)
						.join(" ")}`
				: "")
		);
	}

	private shouldLog(level: LogLevel): boolean {
		return this.level <= level;
	}

	debug(message: string, ...args: unknown[]): void {
		if (!this.shouldLog(LogLevel.DEBUG)) return;

		const levelText = this.colors ? chalk.magenta("DEBUG") : "DEBUG";
		console.log(this.formatMessage(levelText, message, ...args));
	}

	info(message: string, ...args: unknown[]): void {
		if (!this.shouldLog(LogLevel.INFO)) return;

		const levelText = this.colors ? chalk.blue("INFO ") : "INFO ";
		console.log(this.formatMessage(levelText, message, ...args));
	}

	warn(message: string, ...args: unknown[]): void {
		if (!this.shouldLog(LogLevel.WARN)) return;

		const levelText = this.colors ? chalk.yellow("WARN ") : "WARN ";
		console.warn(this.formatMessage(levelText, message, ...args));
	}

	error(message: string, ...args: unknown[]): void {
		if (!this.shouldLog(LogLevel.ERROR)) return;

		const levelText = this.colors ? chalk.red("ERROR") : "ERROR";
		console.error(this.formatMessage(levelText, message, ...args));
	}

	success(message: string, ...args: unknown[]): void {
		if (!this.shouldLog(LogLevel.INFO)) return;

		const levelText = this.colors ? chalk.green("SUCCESS") : "SUCCESS";
		console.log(this.formatMessage(levelText, message, ...args));
	}

	// LiveKit-specific logging methods
	livekit(message: string, ...args: unknown[]): void {
		if (!this.shouldLog(LogLevel.INFO)) return;

		const levelText = this.colors ? chalk.blue.bold("LIVEKIT") : "LIVEKIT";
		console.log(this.formatMessage(levelText, message, ...args));
	}

	audio(message: string, ...args: unknown[]): void {
		if (!this.shouldLog(LogLevel.DEBUG)) return;

		const levelText = this.colors ? chalk.magenta.bold("AUDIO") : "AUDIO";
		console.log(this.formatMessage(levelText, message, ...args));
	}

	device(message: string, ...args: unknown[]): void {
		if (!this.shouldLog(LogLevel.INFO)) return;

		const levelText = this.colors ? chalk.cyan.bold("DEVICE") : "DEVICE";
		console.log(this.formatMessage(levelText, message, ...args));
	}

	// Utility methods
	setLevel(level: LogLevel): void {
		this.level = level;
	}

	getLevel(): LogLevel {
		return this.level;
	}

	createChild(prefix: string): Logger {
		return new Logger({
			level: this.level,
			prefix: this.prefix ? `${this.prefix}:${prefix}` : prefix,
			timestamp: this.timestamp,
			colors: this.colors,
		});
	}
}

// Default logger instance
export const logger = new Logger({
	level:
		process.env.NODE_ENV === "development" ? LogLevel.DEBUG : LogLevel.INFO,
	prefix: "VideoChat",
	timestamp: true,
	colors: true,
});

// Create specialized loggers for different components
export const livekitLogger = logger.createChild("LiveKit");
export const audioLogger = logger.createChild("Audio");
export const deviceLogger = logger.createChild("Device");

// Convenience functions for quick logging
export const log = {
	debug: (msg: string, ...args: unknown[]) => logger.debug(msg, ...args),
	info: (msg: string, ...args: unknown[]) => logger.info(msg, ...args),
	warn: (msg: string, ...args: unknown[]) => logger.warn(msg, ...args),
	error: (msg: string, ...args: unknown[]) => logger.error(msg, ...args),
	success: (msg: string, ...args: unknown[]) => logger.success(msg, ...args),
	livekit: (msg: string, ...args: unknown[]) =>
		livekitLogger.info(msg, ...args),
	audio: (msg: string, ...args: unknown[]) => audioLogger.debug(msg, ...args),
	device: (msg: string, ...args: unknown[]) => deviceLogger.info(msg, ...args),
};
