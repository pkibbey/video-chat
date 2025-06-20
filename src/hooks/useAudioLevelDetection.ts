import { useEffect, useRef, useState } from "react";
import { audioLogger } from "@/lib/logger";

export function useAudioLevelDetection(audioTrack: MediaStreamTrack | null) {
	const [audioLevel, setAudioLevel] = useState(0);
	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);

	useEffect(() => {
		if (!audioTrack) {
			audioLogger.debug("No audio track provided for level detection");
			return;
		}

		audioLogger.info("Setting up audio level detection", {
			trackId: audioTrack.id,
			trackLabel: audioTrack.label,
			trackKind: audioTrack.kind,
			trackEnabled: audioTrack.enabled,
		});

		try {
			const audioContext = new AudioContext();
			const analyser = audioContext.createAnalyser();
			const source = audioContext.createMediaStreamSource(
				new MediaStream([audioTrack]),
			);

			analyser.fftSize = 256;
			source.connect(analyser);

			audioLogger.debug("Audio analysis setup complete", {
				fftSize: analyser.fftSize,
				frequencyBinCount: analyser.frequencyBinCount,
				sampleRate: audioContext.sampleRate,
			});

			const dataArray = new Uint8Array(analyser.frequencyBinCount);
			let frameCount = 0;
			const LOG_INTERVAL = 100; // Log every 100 frames to avoid spam

			const updateAudioLevel = () => {
				analyser.getByteFrequencyData(dataArray);
				const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
				setAudioLevel(average);

				// Log periodically for debugging
				if (frameCount % LOG_INTERVAL === 0) {
					audioLogger.debug("Audio level update", {
						level: Math.round(average),
						frameCount,
						trackId: audioTrack.id,
					});
				}
				frameCount++;

				requestAnimationFrame(updateAudioLevel);
			};

			updateAudioLevel();

			audioContextRef.current = audioContext;
			analyserRef.current = analyser;

			audioLogger.success("Audio level detection started successfully");

			return () => {
				audioLogger.info("Cleaning up audio level detection", {
					trackId: audioTrack.id,
					finalFrameCount: frameCount,
				});
				audioContext.close();
			};
		} catch (error) {
			audioLogger.error("Failed to setup audio level detection", {
				error,
				trackId: audioTrack.id,
			});
		}
	}, [audioTrack]);

	return audioLevel;
}
