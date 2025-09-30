// Utility for conditional logging based on environment
const isDevelopment = process.env.NODE_ENV === 'development';

interface LogLevel {
  ERROR: 'error';
  WARN: 'warn'; 
  INFO: 'info';
  DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info', 
  DEBUG: 'debug',
};

class Logger {
  private shouldLog(level: keyof LogLevel): boolean {
    if (!isDevelopment && level === 'DEBUG') {
      return false;
    }
    return true;
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('ERROR')) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('WARN')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('INFO')) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('DEBUG')) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  // Socket-specific logging with emojis for better visibility
  socket = {
    connect: (socketId: string) => this.info(`🟢 Socket connected: ${socketId}`),
    disconnect: (socketId: string, reason: string) => this.info(`🔴 Socket disconnected: ${socketId}, Reason: ${reason}`),
    error: (error: string | Error) => this.error(`❌ Socket error: ${error}`),
    reconnect: (attemptNumber: number) => this.info(`🔄 Socket reconnection attempt: ${attemptNumber}`),
    reconnected: (attemptNumber: number) => this.info(`🔄 Socket reconnected on attempt: ${attemptNumber}`),
    message: (messageId: string) => this.debug(`📨 Received new message via socket: ${messageId}`),
    init: (url: string) => this.info(`🔌 Initializing Socket.IO server at: ${url}`),
    cleanup: () => this.info(`🔌 Cleaning up socket connection`),
  };
}

export const logger = new Logger();
export { LOG_LEVELS };