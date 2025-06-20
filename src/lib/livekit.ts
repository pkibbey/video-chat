import {
	type LocalParticipant,
	type RemoteParticipant,
	type RemoteTrack,
	Room,
	RoomEvent,
} from "livekit-client";
import { AccessToken } from "livekit-server-sdk";
import { liveKitConfig } from "@/config/livekit";
import { log } from "./logger";

export interface LiveKitTokenOptions {
	roomName: string;
	participantName: string;
	participantIdentity?: string;
}

export class LiveKitService {
	private room: Room | null = null;
	private isConnected = false;

	/**
	 * Generate an access token for joining a room
	 * In production, this should be done on your backend server
	 */
	async generateToken(options: LiveKitTokenOptions): Promise<string> {
		const { roomName, participantName, participantIdentity } = options;

		const at = new AccessToken(liveKitConfig.apiKey, liveKitConfig.apiSecret, {
			identity: participantIdentity || participantName,
			name: participantName,
		});

		at.addGrant({
			room: roomName,
			roomJoin: true,
			canPublish: true,
			canSubscribe: true,
		});

		return await at.toJwt();
	}

	/**
	 * Connect to a LiveKit room
	 */
	async connect(options: LiveKitTokenOptions): Promise<Room> {
		try {
			log.info("Connecting to LiveKit room", { roomName: options.roomName });

			// Create room instance
			this.room = new Room();

			// Set up event listeners
			this.setupEventListeners();

			// Generate token (in production, get this from your backend)
			const token = await this.generateToken(options);

			// Connect to the room
			await this.room.connect(liveKitConfig.wsURL, token);

			this.isConnected = true;
			log.success("Connected to LiveKit room", { roomName: options.roomName });

			return this.room;
		} catch (error) {
			log.error("Failed to connect to LiveKit room", {
				error,
				roomName: options.roomName,
			});
			throw error;
		}
	}

	/**
	 * Enable camera and microphone
	 */
	async enableCameraAndMicrophone(): Promise<void> {
		if (!this.room) {
			throw new Error("Not connected to room");
		}

		try {
			log.info("Enabling camera and microphone");

			await this.room.localParticipant.enableCameraAndMicrophone();

			log.success("Camera and microphone enabled");
		} catch (error) {
			log.error("Failed to enable camera and microphone", { error });
			throw error;
		}
	}

	/**
	 * Disconnect from the room
	 */
	async disconnect(): Promise<void> {
		if (this.room) {
			log.info("Disconnecting from LiveKit room");

			await this.room.disconnect();
			this.room = null;
			this.isConnected = false;

			log.info("Disconnected from LiveKit room");
		}
	}

	/**
	 * Get the current room instance
	 */
	getRoom(): Room | null {
		return this.room;
	}

	/**
	 * Check if connected to a room
	 */
	isRoomConnected(): boolean {
		return this.isConnected && this.room !== null;
	}

	/**
	 * Set up event listeners for the room
	 */
	private setupEventListeners(): void {
		if (!this.room) return;

		this.room.on(RoomEvent.Connected, () => {
			log.info("Room connected");
		});

		this.room.on(RoomEvent.Disconnected, (reason) => {
			log.info("Room disconnected", { reason });
			this.isConnected = false;
		});

		this.room.on(
			RoomEvent.ParticipantConnected,
			(participant: RemoteParticipant) => {
				log.info("Participant connected", {
					identity: participant.identity,
					name: participant.name,
				});
			},
		);

		this.room.on(
			RoomEvent.ParticipantDisconnected,
			(participant: RemoteParticipant) => {
				log.info("Participant disconnected", {
					identity: participant.identity,
					name: participant.name,
				});
			},
		);

		this.room.on(
			RoomEvent.TrackSubscribed,
			(track: RemoteTrack, _publication, participant: RemoteParticipant) => {
				log.info("Track subscribed", {
					trackKind: track.kind,
					participant: participant.identity,
				});
			},
		);

		this.room.on(
			RoomEvent.TrackUnsubscribed,
			(track: RemoteTrack, _publication, participant: RemoteParticipant) => {
				log.info("Track unsubscribed", {
					trackKind: track.kind,
					participant: participant.identity,
				});
			},
		);

		this.room.on(
			RoomEvent.LocalTrackPublished,
			(publication, _participant: LocalParticipant) => {
				log.info("Local track published", {
					trackKind: publication.kind,
				});
			},
		);

		this.room.on(
			RoomEvent.LocalTrackUnpublished,
			(publication, _participant: LocalParticipant) => {
				log.info("Local track unpublished", {
					trackKind: publication.kind,
				});
			},
		);

		this.room.on(RoomEvent.ConnectionQualityChanged, (quality, participant) => {
			log.debug("Connection quality changed", {
				quality,
				participant: participant?.identity,
			});
		});
	}
}
