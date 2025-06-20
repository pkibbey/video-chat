/** biome-ignore-all lint/a11y/noLabelWithoutControl: Testing */
"use client";

import { useEffect, useState } from "react";
import { ClientOnlyVideoChat } from "@/components/ClientOnlyVideoChat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { log } from "@/lib/logger";

export default function Home() {
	const [roomName, setRoomName] = useState("");
	const [isConnected, setIsConnected] = useState(false);
	const [deviceName, setDeviceName] = useState("");

	useEffect(() => {
		log.debug("Home component mounted");
		// Generate a default device name based on user agent or timestamp
		const defaultDeviceName = `Device-${Date.now().toString().slice(-4)}`;
		setDeviceName(defaultDeviceName);
		log.info("Generated default device name", {
			deviceName: defaultDeviceName,
		});
	}, []);

	const joinRoom = async () => {
		if (!roomName.trim()) {
			log.warn("Attempted to join room with empty name");
			return;
		}

		if (!deviceName.trim()) {
			log.warn("Attempted to join room with empty device name");
			return;
		}

		log.info("Joining room", { roomName: roomName.trim(), deviceName });
		setIsConnected(true);
	};

	const leaveRoom = () => {
		log.info("Leaving room", { roomName });
		setIsConnected(false);
		log.success("Successfully left room");
	};

	if (isConnected) {
		return (
			<ClientOnlyVideoChat
				roomName={roomName.trim()}
				deviceName={deviceName.trim()}
				onLeave={leaveRoom}
			/>
		);
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-center p-24">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Multi-Device Video Chat</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<label className="text-sm font-medium">Device Name</label>
						<Input
							value={deviceName}
							onChange={(e) => setDeviceName(e.target.value)}
							placeholder="Enter device name"
						/>
					</div>
					<div>
						<label className="text-sm font-medium">Room Name</label>
						<Input
							value={roomName}
							onChange={(e) => setRoomName(e.target.value)}
							placeholder="Enter room name"
						/>
					</div>
					<Button
						onClick={joinRoom}
						className="w-full"
						disabled={!roomName.trim() || !deviceName.trim()}
					>
						Join Room
					</Button>
				</CardContent>
			</Card>
		</main>
	);
}
