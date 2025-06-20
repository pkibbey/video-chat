"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deviceLogger, log } from "@/lib/logger";

interface Device {
	id: string;
	name: string;
	audioLevel: number;
	isActiveMic: boolean;
	videoEnabled: boolean;
	audioEnabled: boolean;
}

export function DeviceManager() {
	const [devices, setDevices] = useState<Device[]>([]);
	const [activeMicrophoneId, setActiveMicrophoneId] = useState<string | null>(
		null,
	);

	// Audio level threshold for switching microphones
	const AUDIO_THRESHOLD = 30;
	const SWITCH_DELAY = 1000; // 1 second delay to prevent rapid switching

	useEffect(() => {
		log.debug("DeviceManager component mounted");
		deviceLogger.info("Audio threshold configured", {
			AUDIO_THRESHOLD,
			SWITCH_DELAY,
		});
	}, []);

	useEffect(() => {
		// Find device with highest audio level above threshold
		const candidateDevice = devices
			.filter((d) => d.audioLevel > AUDIO_THRESHOLD)
			.sort((a, b) => b.audioLevel - a.audioLevel)[0];

		if (candidateDevice && candidateDevice.id !== activeMicrophoneId) {
			deviceLogger.debug("Candidate device found for microphone switch", {
				candidateDevice: candidateDevice.name,
				candidateId: candidateDevice.id,
				audioLevel: candidateDevice.audioLevel,
				currentActiveMic: activeMicrophoneId,
			});

			// Implement delay to prevent rapid switching
			const timer = setTimeout(() => {
				deviceLogger.info("Switching active microphone", {
					from: activeMicrophoneId,
					to: candidateDevice.id,
					deviceName: candidateDevice.name,
					audioLevel: candidateDevice.audioLevel,
				});

				setActiveMicrophoneId(candidateDevice.id);
				// Mute all other devices
				setDevices((prev) =>
					prev.map((device) => ({
						...device,
						isActiveMic: device.id === candidateDevice.id,
						audioEnabled: device.id === candidateDevice.id,
					})),
				);

				deviceLogger.success("Active microphone switched successfully", {
					newActiveMic: candidateDevice.name,
					mutedDevices: devices.filter((d) => d.id !== candidateDevice.id)
						.length,
				});
			}, SWITCH_DELAY);

			return () => {
				deviceLogger.debug("Clearing microphone switch timer");
				clearTimeout(timer);
			};
		}

		if (devices.length > 0) {
			deviceLogger.debug("No microphone switch needed", {
				devicesAboveThreshold: devices.filter(
					(d) => d.audioLevel > AUDIO_THRESHOLD,
				).length,
				totalDevices: devices.length,
				currentActiveMic: activeMicrophoneId,
			});
		}
	}, [devices, activeMicrophoneId]);

	useEffect(() => {
		deviceLogger.info("Devices state updated", {
			totalDevices: devices.length,
			activeDevices: devices.filter((d) => d.audioEnabled || d.videoEnabled)
				.length,
			devicesWithAudio: devices.filter((d) => d.audioEnabled).length,
			devicesWithVideo: devices.filter((d) => d.videoEnabled).length,
			activeMicDevice: devices.find((d) => d.isActiveMic)?.name || "none",
			devicesAboveThreshold: devices.filter(
				(d) => d.audioLevel > AUDIO_THRESHOLD,
			).length,
		});
	}, [devices]);

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{devices.map((device) => (
				<Card
					key={device.id}
					className={device.isActiveMic ? "border-primary" : ""}
				>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							{device.name}
							{device.isActiveMic && (
								<Badge variant="default">Active Mic</Badge>
							)}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<span className="text-sm">Audio Level:</span>
								<div className="flex-1 bg-muted rounded-full h-2">
									<div
										className="bg-primary h-2 rounded-full transition-all duration-200"
										style={{ width: `${Math.min(device.audioLevel, 100)}%` }}
									/>
								</div>
								<span className="text-xs">{Math.round(device.audioLevel)}</span>
							</div>
							<div className="flex gap-2">
								<Badge variant={device.videoEnabled ? "default" : "secondary"}>
									Video: {device.videoEnabled ? "On" : "Off"}
								</Badge>
								<Badge variant={device.audioEnabled ? "default" : "secondary"}>
									Audio: {device.audioEnabled ? "On" : "Off"}
								</Badge>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
