# Logging System Documentation

This video chat application now includes comprehensive debug logging using a custom logger system.

## Features

### Logger Configuration
- **Environment-based log levels**: Development mode shows DEBUG logs, production shows INFO and above
- **Colored output**: Different colors for different log levels and components
- **Timestamps**: All logs include ISO timestamps
- **Component prefixes**: Specialized loggers for different parts of the app

### Specialized Loggers
- `jitsiLogger`: For Jitsi Meet integration events
- `audioLogger`: For audio level detection and processing
- `deviceLogger`: For device management and switching logic

### Logging Locations

#### 1. Main Application (`src/app/page.tsx`)
- Component mounting
- Room joining/leaving events
- Device name generation
- Error handling for room operations

#### 2. Device Manager (`src/components/DeviceManager.tsx`)
- Device state changes
- Microphone switching logic
- Audio threshold monitoring
- Active device tracking

#### 3. Jitsi Service (`src/lib/jitsi.ts`)
- Connection establishment
- Service initialization
- Connection failures
- Configuration loading

#### 4. Audio Level Detection (`src/hooks/useAudioLevelDetection.ts`)
- Audio context setup
- Audio level monitoring
- Track configuration
- Cleanup operations

#### 5. Configuration (`src/config/jitsi.ts`)
- Configuration loading
- Environment detection

#### 6. Error Handling (`src/components/ErrorBoundary.tsx`)
- React error boundaries
- Unhandled JavaScript errors
- Promise rejections
- Component crash recovery

## Development Tools

### Log Debugger Panel
- Press `Ctrl/Cmd + Shift + L` to toggle the debug panel
- Change log levels in real-time
- Test all log levels with sample messages
- Only available in development mode

### Log Levels
- **DEBUG**: Detailed debugging information (development only)
- **INFO**: General information about app operations
- **WARN**: Warning messages about potential issues
- **ERROR**: Error conditions that need attention
- **SILENT**: No logging output

## Usage Examples

```typescript
import { log, jitsiLogger, audioLogger, deviceLogger } from '@/lib/logger';

// General logging
log.debug('Debug message', { data: 'value' });
log.info('Info message');
log.warn('Warning message');
log.error('Error message', { error });
log.success('Success message');

// Specialized logging
jitsiLogger.info('Jitsi event', { event: 'connection' });
audioLogger.debug('Audio level', { level: 42 });
deviceLogger.info('Device switch', { from: 'device1', to: 'device2' });
```

## Log Output Format

```
[2025-06-19T10:30:45.123Z] [VideoChat] INFO Component mounted { componentName: "Home" }
[2025-06-19T10:30:45.124Z] [VideoChat:Jitsi] INFO Connection established { domain: "meet.jit.si" }
[2025-06-19T10:30:45.125Z] [VideoChat:Device] DEBUG Microphone switch candidate found { deviceId: "12345" }
```

## Error Handling

- **Error Boundary**: Catches React component errors and logs them
- **Global Error Handler**: Catches unhandled JavaScript errors and promise rejections
- **Structured Logging**: All errors include context and stack traces
- **Development Details**: Error details shown in development mode

## Best Practices

1. Use appropriate log levels for different types of messages
2. Include relevant context data with log messages
3. Use specialized loggers for domain-specific events
4. Log both successful operations and failures
5. Avoid logging sensitive information
6. Use structured data objects for complex information

## Production Considerations

- Log level automatically set to INFO in production
- Debug logs filtered out in production builds
- Error reporting includes structured context
- Performance impact minimized through level checking
