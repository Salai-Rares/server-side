import { LogEntry } from './types';

export class LogFormatters {
  static development(entry: LogEntry): void {
    const emoji = this.getLevelEmoji(entry.level);
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    
    console.log(`${emoji} [${timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`);
    
    if (entry.data) {
      console.log(JSON.stringify(entry.data, null, 2));
    }
  }

  static production(entry: LogEntry): void {
    console.log(JSON.stringify(entry));
  }

  private static getLevelEmoji(level: string): string {
    const emojis = {
      error: '❌',
      warn: '⚠️',
      info: 'ℹ️',
      debug: '🐛'
    };
    return emojis[level as keyof typeof emojis] || 'ℹ️';
  }
}