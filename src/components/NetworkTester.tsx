"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NetworkTester() {
	const [testResults, setTestResults] = useState<string[]>([]);

	const addResult = (message: string) => {
		setTestResults((prev) => [
			...prev,
			`${new Date().toLocaleTimeString()}: ${message}`,
		]);
	};

	const testConnectivity = async () => {
		setTestResults([]);
		addResult("🧪 Starting network connectivity tests...");

		// Test 1: LiveKit Cloud WebSocket
		try {
			addResult("Testing LiveKit Cloud connection...");
			const ws = new WebSocket("wss://multicam-klaun5nw.livekit.cloud");

			await new Promise((resolve, reject) => {
				const timeout = setTimeout(() => {
					ws.close();
					reject(new Error("Connection timeout"));
				}, 5000);

				ws.onopen = () => {
					clearTimeout(timeout);
					addResult("✅ LiveKit Cloud WebSocket: Connected successfully");
					ws.close();
					resolve(true);
				};

				ws.onerror = (error) => {
					clearTimeout(timeout);
					reject(error);
				};
			});
		} catch (error) {
			addResult(`❌ LiveKit Cloud WebSocket: Failed - ${error}`);
		}

		// Test 2: Local LiveKit (if applicable)
		try {
			addResult("Testing local LiveKit server...");
			const localWs = new WebSocket("ws://localhost:7880");

			await new Promise((resolve, reject) => {
				const timeout = setTimeout(() => {
					localWs.close();
					reject(new Error("Connection timeout"));
				}, 3000);

				localWs.onopen = () => {
					clearTimeout(timeout);
					addResult("✅ Local LiveKit: Connected successfully");
					localWs.close();
					resolve(true);
				};

				localWs.onerror = (error) => {
					clearTimeout(timeout);
					reject(error);
				};
			});
		} catch (error) {
			addResult(`❌ Local LiveKit: Failed - ${error}`);
		}

		// Test 3: Basic internet connectivity
		try {
			addResult("Testing basic internet connectivity...");
			const response = await fetch("https://api.github.com/zen", {
				method: "GET",
				mode: "cors",
			});
			if (response.ok) {
				addResult("✅ Internet connectivity: Working");
			} else {
				addResult(`❌ Internet connectivity: HTTP ${response.status}`);
			}
		} catch (error) {
			addResult(`❌ Internet connectivity: Failed - ${error}`);
		}

		addResult("🏁 Network tests completed");
	};

	const clearResults = () => {
		setTestResults([]);
	};

	return (
		<Card className="w-full max-w-2xl">
			<CardHeader>
				<CardTitle>Network Connectivity Tester</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex space-x-2">
					<Button onClick={testConnectivity}>Run Tests</Button>
					<Button onClick={clearResults} variant="outline">
						Clear
					</Button>
				</div>

				{testResults.length > 0 && (
					<div className="border rounded p-3 bg-gray-50 max-h-64 overflow-y-auto">
						<div className="text-sm font-mono space-y-1">
							{testResults.map((result) => (
								<div key={result} className="whitespace-pre-wrap">
									{result}
								</div>
							))}
						</div>
					</div>
				)}

				<div className="text-xs text-gray-600 space-y-1">
					<p>
						<strong>This test checks:</strong>
					</p>
					<ul className="list-disc list-inside ml-2">
						<li>LiveKit Cloud WebSocket connection</li>
						<li>Local LiveKit server (if running)</li>
						<li>Basic internet connectivity</li>
					</ul>
					<p>
						<strong>Expected for cross-browser:</strong> LiveKit Cloud should be
						✅, Local should be ❌
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
