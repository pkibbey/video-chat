export interface LiveKitConfig {
	wsURL: string;
	apiKey: string;
	apiSecret: string;
}

// Default configuration for local development
// You can override these with environment variables
export const liveKitConfig: LiveKitConfig = {
	// For local development, you can use LiveKit's cloud service or run locally
	// Cloud: wss://your-project.livekit.cloud
	// Local: ws://localhost:7880
	wsURL: process.env.NEXT_PUBLIC_LIVEKIT_WS_URL || "ws://localhost:7880",

	// These should be set in your environment variables
	apiKey: process.env.LIVEKIT_API_KEY || "devkey",
	apiSecret: process.env.LIVEKIT_API_SECRET || "secret",
};

// Room options
export const roomOptions = {
	// Automatically manage camera and microphone
	adaptiveStream: true,
	dynacast: true,

	// Video quality settings
	videoCaptureDefaults: {
		resolution: {
			width: 1280,
			height: 720,
		},
		facingMode: "user",
	},

	// Audio settings
	audioCaptureDefaults: {
		echoCancellation: true,
		noiseSuppression: true,
		autoGainControl: true,
	},
};
