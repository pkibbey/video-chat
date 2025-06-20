"use client";

import { useEffect, useState } from "react";
import { EnhancedVideoChat } from "./EnhancedVideoChat";
import { VideoChat } from "./VideoChat";

interface ClientOnlyVideoChatProps {
	roomName: string;
	deviceName: string;
	onLeave: () => void;
}

export function ClientOnlyVideoChat(props: ClientOnlyVideoChatProps) {
	const [isClient, setIsClient] = useState(false);
	const [useEnhanced, setUseEnhanced] = useState(false);

	useEffect(() => {
		setIsClient(true);
		// Check if we should use enhanced version from localStorage for testing
		const enhanced = localStorage.getItem("useEnhancedVideoChat") === "true";
		setUseEnhanced(enhanced);
	}, []);

	if (!isClient) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4" />
					<p>Loading video chat...</p>
				</div>
			</div>
		);
	}

	if (useEnhanced) {
		return <EnhancedVideoChat {...props} />;
	}

	return <VideoChat {...props} />;
}
