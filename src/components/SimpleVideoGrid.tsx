"use client";

import type { TrackReferenceOrPlaceholder } from "@livekit/components-core";
import { TrackLoop } from "@livekit/components-react";
import { cn } from "@/lib/utils";

interface SimpleVideoGridProps {
	tracks: TrackReferenceOrPlaceholder[];
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
}

export function SimpleVideoGrid({
	tracks,
	children,
	className,
	style,
	...props
}: SimpleVideoGridProps & React.HTMLAttributes<HTMLDivElement>) {
	// Ultra-simple responsive grid: auto-fit with minimum 300px columns
	return (
		<div
			className={cn("simple-video-grid", className)}
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
				gap: "1rem",
				padding: "1rem",
				height: "100%",
				width: "100%",
				...style,
			}}
			{...props}
		>
			<TrackLoop tracks={tracks}>{children}</TrackLoop>
		</div>
	);
}
