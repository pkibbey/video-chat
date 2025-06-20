"use client";

import { useEffect, useState } from "react";
import { VideoChat } from "./VideoChat";

interface ClientOnlyVideoChatProps {
	roomName: string;
	deviceName: string;
	onLeave: () => void;
}

export function ClientOnlyVideoChat(props: ClientOnlyVideoChatProps) {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
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

	return <VideoChat {...props} />;
}
