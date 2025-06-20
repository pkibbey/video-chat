"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogLevel, logger } from "@/lib/logger";

const LOG_LEVEL_NAMES = {
	[LogLevel.DEBUG]: "DEBUG",
	[LogLevel.INFO]: "INFO",
	[LogLevel.WARN]: "WARN",
	[LogLevel.ERROR]: "ERROR",
	[LogLevel.SILENT]: "SILENT",
};

const LOG_LEVEL_COLORS = {
	[LogLevel.DEBUG]: "bg-purple-100 text-purple-800",
	[LogLevel.INFO]: "bg-blue-100 text-blue-800",
	[LogLevel.WARN]: "bg-yellow-100 text-yellow-800",
	[LogLevel.ERROR]: "bg-red-100 text-red-800",
	[LogLevel.SILENT]: "bg-gray-100 text-gray-800",
};

interface LogDebuggerProps {
	visible?: boolean;
}

export function LogDebugger({ visible = false }: LogDebuggerProps) {
	const [currentLevel, setCurrentLevel] = useState(logger.getLevel());
	const [isVisible, setIsVisible] = useState(visible);

	useEffect(() => {
		// Keyboard shortcut to toggle debugger (Ctrl/Cmd + Shift + L)
		const handleKeyboard = (event: KeyboardEvent) => {
			if (
				(event.ctrlKey || event.metaKey) &&
				event.shiftKey &&
				event.key === "L"
			) {
				event.preventDefault();
				setIsVisible((prev) => !prev);
				logger.debug("Log debugger toggled", { visible: !isVisible });
			}
		};

		if (!window) {
			console.warn(
				"LogDebugger: window is not defined. This may happen in server-side rendering environments.",
			);
			return;
		}
		window.addEventListener("keydown", handleKeyboard);

		return () => window.removeEventListener("keydown", handleKeyboard);
	}, [isVisible]);

	const changeLogLevel = (level: LogLevel) => {
		logger.setLevel(level);
		setCurrentLevel(level);
		logger.info("Log level changed", {
			newLevel: LOG_LEVEL_NAMES[level],
			previousLevel: LOG_LEVEL_NAMES[currentLevel],
		});
	};

	const testLogs = () => {
		logger.debug("Debug log test", { timestamp: Date.now() });
		logger.info("Info log test", { timestamp: Date.now() });
		logger.warn("Warning log test", { timestamp: Date.now() });
		logger.error("Error log test", { timestamp: Date.now() });
		logger.success("Success log test", { timestamp: Date.now() });
	};

	if (!isVisible) {
		return null;
	}

	return (
		<div className="fixed top-4 right-4 z-50 w-80">
			<Card className="shadow-lg border-2">
				<CardHeader className="pb-2">
					<CardTitle className="text-sm flex justify-between items-center">
						Logger Debug Panel
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => setIsVisible(false)}
							className="h-6 w-6 p-0"
						>
							×
						</Button>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div>
						<div className="text-xs font-medium mb-2">Current Log Level:</div>
						<Badge className={LOG_LEVEL_COLORS[currentLevel]}>
							{LOG_LEVEL_NAMES[currentLevel]}
						</Badge>
					</div>

					<div>
						<div className="text-xs font-medium mb-2">Change Level:</div>
						<div className="flex flex-wrap gap-1">
							{Object.entries(LOG_LEVEL_NAMES).map(([level, name]) => (
								<Button
									key={level}
									type="button"
									variant={
										currentLevel === Number(level) ? "default" : "outline"
									}
									size="sm"
									onClick={() => changeLogLevel(Number(level) as LogLevel)}
									className="text-xs h-6"
								>
									{name}
								</Button>
							))}
						</div>
					</div>

					<div>
						<Button
							type="button"
							variant="secondary"
							size="sm"
							onClick={testLogs}
							className="w-full text-xs"
						>
							Test All Log Levels
						</Button>
					</div>

					<div className="text-xs text-muted-foreground">
						Press Ctrl/Cmd + Shift + L to toggle this panel
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// Helper hook to conditionally show the debugger in development
export function useLogDebugger(
	enabled: boolean = process.env.NODE_ENV === "development",
) {
	return enabled;
}
