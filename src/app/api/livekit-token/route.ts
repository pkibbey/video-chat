import { AccessToken } from "livekit-server-sdk";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { liveKitConfig } from "@/config/livekit";
import { roomManager } from "@/lib/room-management";

export async function POST(request: NextRequest) {
	try {
		const { roomName, participantName, participantIdentity, createRoom } =
			await request.json();

		console.log("🔧 LiveKit Token Request:", {
			roomName,
			participantName,
			participantIdentity,
			createRoom,
			wsURL: liveKitConfig.wsURL,
			apiKey: liveKitConfig.apiKey ? "***exists***" : "missing",
			apiSecret: liveKitConfig.apiSecret ? "***exists***" : "missing",
		});

		if (!roomName || !participantName) {
			return NextResponse.json(
				{ error: "roomName and participantName are required" },
				{ status: 400 },
			);
		}

		// Optionally pre-create the room with specific settings
		if (createRoom) {
			try {
				await roomManager.createRoom(roomName, {
					maxParticipants: 10, // Adjust as needed for multicam setup
					emptyTimeout: 30 * 60, // 30 minutes - longer timeout for multicam sessions
				});
				console.log("✅ Room created/verified:", roomName);
			} catch (error) {
				console.warn(
					"⚠️ Room creation failed (room might already exist):",
					error,
				);
				// Continue anyway - room will be auto-created on join
			}
		}

		// Create access token
		const at = new AccessToken(liveKitConfig.apiKey, liveKitConfig.apiSecret, {
			identity: participantIdentity || participantName,
			name: participantName,
		});

		// Add grants for the room
		at.addGrant({
			room: roomName,
			roomJoin: true,
			canPublish: true,
			canSubscribe: true,
		});

		// Generate JWT token
		const token = await at.toJwt();

		console.log("✅ LiveKit Token Generated Successfully:", {
			roomName,
			participantName,
			participantIdentity,
			tokenLength: token.length,
		});

		return NextResponse.json({ token });
	} catch (error) {
		console.error("❌ Error generating LiveKit token:", error);
		return NextResponse.json(
			{ error: "Failed to generate token" },
			{ status: 500 },
		);
	}
}
