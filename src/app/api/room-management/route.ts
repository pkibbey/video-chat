import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { roomManager } from "@/lib/room-management";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const action = searchParams.get("action");
		const roomName = searchParams.get("roomName");

		switch (action) {
			case "list": {
				const rooms = await roomManager.listRooms();
				return NextResponse.json({ rooms });
			}

			case "info": {
				if (!roomName) {
					return NextResponse.json(
						{ error: "roomName is required for info action" },
						{ status: 400 },
					);
				}
				const roomInfo = await roomManager.getRoomInfo(roomName);
				return NextResponse.json({ room: roomInfo });
			}

			default:
				return NextResponse.json(
					{ error: "Invalid action. Use 'list' or 'info'" },
					{ status: 400 },
				);
		}
	} catch (error) {
		console.error("❌ Error in room management API:", error);
		return NextResponse.json(
			{ error: "Failed to perform room operation" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const { action, roomName, options } = await request.json();

		switch (action) {
			case "create": {
				if (!roomName) {
					return NextResponse.json(
						{ error: "roomName is required for create action" },
						{ status: 400 },
					);
				}
				const room = await roomManager.createRoom(roomName, options);
				return NextResponse.json({ room });
			}

			case "delete": {
				if (!roomName) {
					return NextResponse.json(
						{ error: "roomName is required for delete action" },
						{ status: 400 },
					);
				}
				await roomManager.deleteRoom(roomName);
				return NextResponse.json({ success: true });
			}

			default:
				return NextResponse.json(
					{ error: "Invalid action. Use 'create' or 'delete'" },
					{ status: 400 },
				);
		}
	} catch (error) {
		console.error("❌ Error in room management API:", error);
		return NextResponse.json(
			{ error: "Failed to perform room operation" },
			{ status: 500 },
		);
	}
}
