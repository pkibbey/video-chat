import { AccessToken } from "livekit-server-sdk";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { liveKitConfig } from "@/config/livekit";

export async function POST(request: NextRequest) {
	try {
		const { roomName, participantName, participantIdentity } =
			await request.json();

		if (!roomName || !participantName) {
			return NextResponse.json(
				{ error: "roomName and participantName are required" },
				{ status: 400 },
			);
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

		return NextResponse.json({ token });
	} catch (error) {
		console.error("Error generating LiveKit token:", error);
		return NextResponse.json(
			{ error: "Failed to generate token" },
			{ status: 500 },
		);
	}
}
