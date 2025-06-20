import { RoomServiceClient } from "livekit-server-sdk";
import { liveKitConfig } from "@/config/livekit";
import { log } from "./logger";

export class LiveKitRoomManager {
	private client: RoomServiceClient;

	constructor() {
		this.client = new RoomServiceClient(
			liveKitConfig.wsURL,
			liveKitConfig.apiKey,
			liveKitConfig.apiSecret,
		);
	}

	/**
	 * Create a room with specific settings
	 * This is optional - rooms are auto-created when participants join
	 */
	async createRoom(
		roomName: string,
		options?: {
			maxParticipants?: number;
			emptyTimeout?: number; // in seconds
		},
	) {
		try {
			log.info("Creating LiveKit room", { roomName, options });

			const request = {
				name: roomName,
				emptyTimeout: options?.emptyTimeout || 10 * 60, // 10 minutes default
				maxParticipants: options?.maxParticipants || 20,
			};

			const room = await this.client.createRoom(request);

			log.success("Room created successfully", {
				roomName: room.name,
				sid: room.sid,
			});

			return room;
		} catch (error) {
			// Room might already exist, which is fine
			if (error instanceof Error && error.message.includes("already exists")) {
				log.info("Room already exists", { roomName });
				return null;
			}

			log.error("Failed to create room", { error, roomName });
			throw error;
		}
	}

	/**
	 * List all active rooms
	 */
	async listRooms() {
		try {
			const rooms = await this.client.listRooms([]);
			log.debug("Listed rooms", { count: rooms.length });
			return rooms;
		} catch (error) {
			log.error("Failed to list rooms", { error });
			throw error;
		}
	}

	/**
	 * Delete a room (disconnects all participants)
	 */
	async deleteRoom(roomName: string) {
		try {
			log.info("Deleting room", { roomName });

			await this.client.deleteRoom(roomName);

			log.success("Room deleted successfully", { roomName });
		} catch (error) {
			log.error("Failed to delete room", { error, roomName });
			throw error;
		}
	}

	/**
	 * Get room information
	 */
	async getRoomInfo(roomName: string) {
		try {
			const rooms = await this.listRooms();
			return rooms.find((room: any) => room.name === roomName);
		} catch (error) {
			log.error("Failed to get room info", { error, roomName });
			throw error;
		}
	}
}

// Export singleton instance
export const roomManager = new LiveKitRoomManager();
