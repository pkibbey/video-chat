import { log } from "@/lib/logger";
import { roomManager } from "@/lib/room-management";

/**
 * Pre-create some default rooms for common use cases
 */
export async function initializeDefaultRooms() {
	const defaultRooms = [
		{
			name: "general",
			description: "General purpose room for casual meetings",
			maxParticipants: 8,
			emptyTimeout: 30 * 60, // 30 minutes
		},
		{
			name: "multicam-studio",
			description: "Studio room optimized for multicam setups",
			maxParticipants: 15, // Multiple devices per person
			emptyTimeout: 60 * 60, // 1 hour
		},
		{
			name: "meeting-room-1",
			description: "Formal meeting room",
			maxParticipants: 10,
			emptyTimeout: 45 * 60, // 45 minutes
		},
	];

	const results = [];

	for (const roomConfig of defaultRooms) {
		try {
			log.info("Creating default room", { roomName: roomConfig.name });

			const room = await roomManager.createRoom(roomConfig.name, {
				maxParticipants: roomConfig.maxParticipants,
				emptyTimeout: roomConfig.emptyTimeout,
			});

			if (room) {
				results.push({
					...roomConfig,
					success: true,
					room,
				});
				log.success("Default room created", { roomName: roomConfig.name });
			} else {
				results.push({
					...roomConfig,
					success: true,
					room: null,
					message: "Room already exists",
				});
				log.info("Default room already exists", { roomName: roomConfig.name });
			}
		} catch (error) {
			results.push({
				...roomConfig,
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			});
			log.error("Failed to create default room", {
				roomName: roomConfig.name,
				error,
			});
		}
	}

	return results;
}

/**
 * API endpoint helper to initialize default rooms
 */
export async function GET() {
	try {
		log.info("Initializing default rooms");
		const results = await initializeDefaultRooms();

		return Response.json({
			success: true,
			results,
			summary: {
				total: results.length,
				created: results.filter((r) => r.success).length,
				failed: results.filter((r) => !r.success).length,
			},
		});
	} catch (error) {
		log.error("Failed to initialize default rooms", { error });
		return Response.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
