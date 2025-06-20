"use client";

import {
	useConnectionState,
	useLocalParticipant,
	useParticipants,
	useRemoteParticipants,
	useRoomContext,
	useRoomInfo,
} from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { liveKitConfig } from "@/config/livekit";

export function ParticipantDebugger() {
	const allParticipants = useParticipants();
	const remoteParticipants = useRemoteParticipants();
	const localParticipant = useLocalParticipant();
	const roomInfo = useRoomInfo();
	const connectionState = useConnectionState();
	const room = useRoomContext();

	// Debug: Log the full room object to understand its structure
	console.log("Full room object: ", room);

	// Get room ID from the room context
	const roomId = room?.name || "Unknown";

	// Log participants for debugging
	console.log("ParticipantDebugger Debug:", {
		allParticipants: allParticipants.length,
		remoteParticipants: remoteParticipants.length,
		roomName: roomInfo?.name,
		roomId: roomId,
		serverURL: liveKitConfig.wsURL,
		connectionState,
		participants: allParticipants.map((p) => ({
			identity: p.identity,
			name: p.name,
			isLocal: p.isLocal,
		})),
	});

	return (
		<div className="absolute top-4 right-4 z-50 space-y-2 max-w-sm">
			<Card className="bg-black/80 text-white">
				<CardHeader className="pb-2">
					<CardTitle className="text-sm">Debug Info</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 text-xs">
					<div>
						<Badge variant="outline" className="text-white border-white">
							Total: {allParticipants.length}
						</Badge>
						<Badge variant="outline" className="text-white border-white ml-1">
							Remote: {remoteParticipants.length}
						</Badge>
					</div>

					<div className="border-t pt-2">
						<div className="font-semibold">Room Info:</div>
						<div>Name: {roomInfo?.name || "Unknown"}</div>
						<div>ID: {roomId}</div>
						<div>Server: {liveKitConfig.wsURL}</div>
						<div>Connection: {connectionState}</div>
						<div
							className={`inline-block px-2 py-1 rounded text-xs ${
								connectionState === ConnectionState.Connected
									? "bg-green-600"
									: "bg-red-600"
							}`}
						>
							{connectionState === ConnectionState.Connected
								? "🟢 Connected"
								: "🔴 Not Connected"}
						</div>
					</div>

					{localParticipant && (
						<div className="border-t pt-2">
							<div className="font-semibold">Local Participant:</div>
							<div>Identity: {localParticipant.localParticipant.identity}</div>
							<div>Name: {localParticipant.localParticipant.name}</div>
							<div>
								Video: {localParticipant.isCameraEnabled ? "✅" : "❌"}
								Audio: {localParticipant.isMicrophoneEnabled ? "✅" : "❌"}
							</div>
							<div>
								Video Tracks:{" "}
								{localParticipant.localParticipant.videoTrackPublications.size}
								Audio Tracks:{" "}
								{localParticipant.localParticipant.audioTrackPublications.size}
							</div>
						</div>
					)}

					{remoteParticipants.length > 0 && (
						<div className="border-t pt-2">
							<div className="font-semibold">Remote Participants:</div>
							{remoteParticipants.map((participant) => (
								<div
									key={participant.identity}
									className="mt-1 p-1 border rounded"
								>
									<div>Identity: {participant.identity}</div>
									<div>Name: {participant.name}</div>
									<div>
										Video: {participant.isCameraEnabled ? "✅" : "❌"}
										Audio: {participant.isMicrophoneEnabled ? "✅" : "❌"}
									</div>
									<div>
										Video Tracks: {participant.videoTrackPublications.size}
										Audio Tracks: {participant.audioTrackPublications.size}
									</div>
								</div>
							))}
						</div>
					)}

					{remoteParticipants.length === 0 && (
						<div className="border-t pt-2 text-yellow-300">
							<div className="font-semibold">🚨 No Remote Participants</div>
							<div className="text-xs mt-1">
								To test multi-participant video:
								<br />• Open another browser tab/window
								<br />• Use same room name
								<br />• Join with different device name
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
