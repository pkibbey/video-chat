"use client";

import { useErrorLogging } from "./ErrorBoundary";

export function ClientErrorLogger() {
	useErrorLogging();
	return null; // This component doesn't render anything
}
