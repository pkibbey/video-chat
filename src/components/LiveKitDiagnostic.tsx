"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { liveKitConfig } from "@/config/livekit";

export function LiveKitDiagnostic() {
	const [testResult, setTestResult] = useState<string>("");

	const testConnection = async () => {
		setTestResult("Testing connection...");

		try {
			// Test if we can reach the WebSocket URL
			const wsUrl = liveKitConfig.wsURL;
			setTestResult(`Testing connection to: ${wsUrl}`);

			// Try to create a WebSocket connection
			const ws = new WebSocket(wsUrl);

			ws.onopen = () => {
				setTestResult(`✅ Successfully connected to ${wsUrl}`);
				ws.close();
			};

			ws.onerror = (error) => {
				setTestResult(`❌ Failed to connect to ${wsUrl}. Error: ${error}`);
			};

			ws.onclose = (event) => {
				if (event.code !== 1000) {
					setTestResult(
						`❌ Connection closed unexpectedly. Code: ${event.code}, Reason: ${event.reason}`,
					);
				}
			};

			// Timeout after 5 seconds
			setTimeout(() => {
				if (ws.readyState === WebSocket.CONNECTING) {
					ws.close();
					setTestResult(`❌ Connection timeout to ${wsUrl}`);
				}
			}, 5000);
		} catch (error) {
			setTestResult(`❌ Error: ${error}`);
		}
	};

	return (
		<Card className="w-full max-w-2xl">
			<CardHeader>
				<CardTitle>LiveKit Connection Diagnostic</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<div>
						<strong>WebSocket URL:</strong> <code>{liveKitConfig.wsURL}</code>
					</div>
					<div>
						<strong>API Key:</strong>{" "}
						<code>{liveKitConfig.apiKey ? "***set***" : "not set"}</code>
					</div>
					<div>
						<strong>API Secret:</strong>{" "}
						<code>{liveKitConfig.apiSecret ? "***set***" : "not set"}</code>
					</div>
				</div>

				<div className="space-y-2">
					<Button onClick={testConnection}>Test WebSocket Connection</Button>
					{testResult && (
						<div className="p-3 bg-gray-100 rounded border">
							<pre className="text-sm">{testResult}</pre>
						</div>
					)}
				</div>

				<div className="border-t pt-4">
					<h3 className="font-semibold mb-2">Troubleshooting Guide:</h3>
					<ul className="text-sm space-y-1 list-disc list-inside">
						<li>
							<strong>If using localhost:</strong> Only works on same machine
						</li>
						<li>
							<strong>For cross-machine:</strong> Use LiveKit Cloud or expose
							local server
						</li>
						<li>
							<strong>Environment variables:</strong> Restart dev server after
							changes
						</li>
						<li>
							<strong>Firewall:</strong> Check if WebSocket ports are blocked
						</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}
