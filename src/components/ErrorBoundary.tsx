"use client";

import React from "react";
import { log } from "@/lib/logger";

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
	errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
	children: React.ReactNode;
	fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null, errorInfo: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		log.error("React Error Boundary caught an error", {
			errorMessage: error.message,
			errorName: error.name,
			errorStack: error.stack,
		});

		return {
			hasError: true,
			error,
			errorInfo: null,
		};
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		log.error("React Error Boundary componentDidCatch", {
			error: {
				message: error.message,
				name: error.name,
				stack: error.stack,
			},
			errorInfo: {
				componentStack: errorInfo.componentStack,
			},
			timestamp: new Date().toISOString(),
		});

		this.setState({
			error,
			errorInfo,
		});
	}

	handleReset = () => {
		log.info("Error boundary reset triggered");
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		});
	};

	render() {
		if (this.state.hasError) {
			log.debug("Error boundary rendering fallback UI");

			if (this.props.fallback) {
				const FallbackComponent = this.props.fallback;
				return (
					<FallbackComponent
						error={this.state.error as Error}
						reset={this.handleReset}
					/>
				);
			}

			return (
				<div className="flex flex-col items-center justify-center min-h-screen p-4">
					<div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
						<h2 className="text-lg font-semibold text-red-800 mb-2">
							Something went wrong
						</h2>
						<p className="text-red-600 mb-4">
							An error occurred while rendering this component. Please try
							refreshing the page.
						</p>
						<div className="space-y-2">
							<button
								type="button"
								onClick={this.handleReset}
								className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
							>
								Try Again
							</button>
							<button
								type="button"
								onClick={() => window.location.reload()}
								className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
							>
								Refresh Page
							</button>
						</div>
						{process.env.NODE_ENV === "development" && this.state.error && (
							<details className="mt-4">
								<summary className="cursor-pointer text-sm text-red-700">
									Error Details (Development Only)
								</summary>
								<pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
									{this.state.error.stack}
								</pre>
							</details>
						)}
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

// Hook for logging unhandled errors
export function useErrorLogging() {
	React.useEffect(() => {
		const handleError = (event: ErrorEvent) => {
			log.error("Unhandled JavaScript error", {
				message: event.message,
				filename: event.filename,
				lineno: event.lineno,
				colno: event.colno,
				error: event.error?.stack,
				timestamp: new Date().toISOString(),
			});
		};

		const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
			log.error("Unhandled Promise rejection", {
				reason: event.reason,
				timestamp: new Date().toISOString(),
			});
		};

		if (typeof window === "undefined") {
			log.warn(
				"useErrorLogging called on server side, skipping event listeners",
			);
			return;
		}

		window.addEventListener("error", handleError);
		window.addEventListener("unhandledrejection", handleUnhandledRejection);

		log.debug("Global error handlers registered");

		return () => {
			window.removeEventListener("error", handleError);
			window.removeEventListener(
				"unhandledrejection",
				handleUnhandledRejection,
			);
			log.debug("Global error handlers unregistered");
		};
	}, []);
}
