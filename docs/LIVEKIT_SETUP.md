# LiveKit Setup Guide

This project has been migrated from Jitsi Meet to LiveKit for improved reliability and developer experience.

## Quick Start

### Option 1: Local Development (Recommended for testing)

1. **Install LiveKit Server locally:**
   ```bash
   # Using Homebrew (macOS)
   brew install livekit
   
   # Or download from https://github.com/livekit/livekit/releases
   ```

2. **Start LiveKit Server:**
   ```bash
   livekit-server --dev
   ```
   This starts LiveKit on `ws://localhost:7880` with default dev credentials.

3. **Copy environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   The default values in `.env.example` work with the local dev server.

4. **Start the application:**
   ```bash
   npm run dev
   ```

### Option 2: LiveKit Cloud

1. **Sign up at [LiveKit Cloud](https://cloud.livekit.io)**

2. **Create a project and get your credentials:**
   - API Key
   - API Secret  
   - WebSocket URL (e.g., `wss://your-project.livekit.cloud`)

3. **Update environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_LIVEKIT_WS_URL=wss://your-project.livekit.cloud
   LIVEKIT_API_KEY=your-api-key
   LIVEKIT_API_SECRET=your-api-secret
   ```

4. **Start the application:**
   ```bash
   npm run dev
   ```

## Features

- **Real-time video conferencing** with automatic layout management
- **Audio/video controls** built-in
- **Screen sharing** support
- **Participant management** 
- **Connection quality indicators**
- **Mobile responsive** design

## Development

The main components are:

- **`src/components/VideoChat.tsx`** - Main video chat interface using LiveKit React components
- **`src/lib/livekit.ts`** - LiveKit service wrapper
- **`src/config/livekit.ts`** - LiveKit configuration

## Production Deployment

⚠️ **Important**: The current implementation generates JWT tokens on the client side for development convenience. 

For production, you should:

1. **Create a backend API endpoint** to generate tokens
2. **Move the token generation logic** to your backend
3. **Update the VideoChat component** to fetch tokens from your API

Example backend endpoint:
```typescript
// pages/api/livekit-token.ts
import { AccessToken } from 'livekit-server-sdk';

export default function handler(req, res) {
  const { roomName, participantName } = req.body;
  
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: participantName,
      name: participantName,
    }
  );

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  res.json({ token: at.toJwt() });
}
```

## Troubleshooting

### Connection Issues
- Ensure LiveKit server is running (`livekit-server --dev`)
- Check WebSocket URL in environment variables
- Verify API credentials

### HTTPS Requirements
- LiveKit requires HTTPS in production
- Use `npm run dev:https` for local HTTPS testing
- Check camera/microphone permissions

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support  
- Safari: Full support
- Mobile browsers: Full support

## Migration Notes

This project was migrated from Jitsi Meet to LiveKit. The following files were removed:
- `src/lib/jitsi.ts`
- `src/components/JitsiLoader.tsx` 
- `src/config/jitsi.ts`
- Jitsi-related dependencies

The new LiveKit implementation provides:
- ✅ Better reliability and performance
- ✅ Modern React components with hooks
- ✅ Simpler setup and configuration
- ✅ Better mobile support
- ✅ Active development and support
