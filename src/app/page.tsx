/** biome-ignore-all lint/a11y/noLabelWithoutControl: Testing */
"use client";

import { useEffect, useState } from "react";
import { ClientOnlyVideoChat } from "@/components/ClientOnlyVideoChat";
import { LiveKitDiagnostic } from "@/components/LiveKitDiagnostic";
import { NetworkTester } from "@/components/NetworkTester";
import { RoomManager } from "@/components/RoomManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { log } from "@/lib/logger";

export default function Home() {
	const [roomName, setRoomName] = useState("");
	const [isConnected, setIsConnected] = useState(false);
	const [deviceName, setDeviceName] = useState("");
	const [useEnhanced, setUseEnhanced] = useState(false);
	const [showDiagnostic, setShowDiagnostic] = useState(false);
	const [showRoomManager, setShowRoomManager] = useState(false);

	useEffect(() => {
		log.debug("Home component mounted");
		// Generate a default device name based on user agent or timestamp
		const defaultDeviceName = `Device-${Date.now().toString().slice(-4)}`;
		setDeviceName(defaultDeviceName);
		log.info("Generated default device name", {
			deviceName: defaultDeviceName,
		});

		// Check current enhanced setting
		const enhanced = localStorage.getItem("useEnhancedVideoChat") === "true";
		setUseEnhanced(enhanced);
	}, []);

	const toggleEnhanced = () => {
		const newValue = !useEnhanced;
		setUseEnhanced(newValue);
		localStorage.setItem("useEnhancedVideoChat", newValue.toString());
		log.info("Toggled enhanced video chat", { useEnhanced: newValue });
	};

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
		<main className="flex min-h-screen flex-col items-center justify-center p-8">
			<div className="space-y-6 w-full max-w-4xl">
				{!showRoomManager ? (
					// Main connection interface
					<div className="space-y-6">
						<Card className="w-full max-w-md mx-auto">
							<CardHeader>
								<CardTitle>Multi-Device Video Chat</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">Video Chat Mode:</span>
									<Button
										variant={useEnhanced ? "default" : "outline"}
										size="sm"
										onClick={toggleEnhanced}
									>
										{useEnhanced ? "Enhanced" : "Standard"}
									</Button>
								</div>
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
										placeholder="Enter room name or select from existing"
									/>
								</div>
								<Button
									onClick={joinRoom}
									className="w-full"
									disabled={!roomName.trim() || !deviceName.trim()}
								>
									Join Room
								</Button>

								<div className="space-y-2">
									<Button
										onClick={() => setShowRoomManager(true)}
										variant="outline"
										className="w-full"
									>
										Manage Rooms
									</Button>

									<Button
										onClick={() => setShowDiagnostic(!showDiagnostic)}
										variant="outline"
										className="w-full"
									>
										{showDiagnostic ? "Hide" : "Show"} Connection Diagnostic
									</Button>
								</div>
							</CardContent>
						</Card>

						{showDiagnostic && (
							<div className="space-y-4 max-w-md mx-auto">
								<LiveKitDiagnostic />
								<NetworkTester />
							</div>
						)}
					</div>
				) : (
					// Room management interface
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<h1 className="text-2xl font-bold">Room Management</h1>
							<Button
								onClick={() => setShowRoomManager(false)}
								variant="outline"
							>
								Back to Join Room
							</Button>
						</div>

						<RoomManager
							onRoomSelected={(selectedRoomName) => {
								setRoomName(selectedRoomName);
								log.info("Room selected from manager", {
									roomName: selectedRoomName,
								});
							}}
							selectedRoom={roomName}
						/>

						{roomName && (
							<Card className="max-w-md mx-auto">
								<CardHeader>
									<CardTitle>Join Selected Room</CardTitle>
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
										<label className="text-sm font-medium">Selected Room</label>
										<Input value={roomName} readOnly className="bg-gray-50" />
									</div>
									<Button
										onClick={joinRoom}
										className="w-full"
										disabled={!roomName.trim() || !deviceName.trim()}
									>
										Join {roomName}
									</Button>
								</CardContent>
							</Card>
						)}
					</div>
				)}
			</div>
		</main>
	);
}
