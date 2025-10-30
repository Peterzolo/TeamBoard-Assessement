import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MemoryManagerService } from './memory-manager.service';

@Injectable()
export class MemoryMonitorService {
  private readonly logger = new Logger(MemoryMonitorService.name);
  private readonly isMonitorEnabled =
    (process.env.MEMORY_MONITOR_ENABLED ?? 'true') !== 'false';
  private readonly areLogsEnabled =
    (process.env.MEMORY_MONITOR_LOGS_ENABLED ?? 'true') !== 'false';

  constructor(private readonly memoryManager: MemoryManagerService) {}

  /**
   * Monitor memory every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  monitorMemory() {
    try {
      if (!this.isMonitorEnabled) return;
      this.memoryManager.monitorMemoryUsage();

      const stats = this.memoryManager.getMemoryStats();
      const recommendations = this.memoryManager.getMemoryRecommendations();

      if (this.areLogsEnabled && recommendations.length > 0) {
        this.logger.log(
          `Memory recommendations: ${recommendations.join(', ')}`,
        );
      }

      // Log memory stats every 30 minutes (every 6th call)
      if (this.areLogsEnabled && new Date().getMinutes() % 30 === 0) {
        this.logger.log(
          `Memory Stats: ${stats.heapUsed}MB/${stats.heapTotal}MB (${stats.heapUsagePercent}%)`,
        );
      }
    } catch (error) {
      if (this.areLogsEnabled) {
        this.logger.error('Memory monitoring failed:', error.message);
      }
    }
  }

  /**
   * Force garbage collection every hour if memory usage is high
   */
  @Cron(CronExpression.EVERY_HOUR)
  performGarbageCollection() {
    try {
      if (!this.isMonitorEnabled) return;
      const stats = this.memoryManager.getMemoryStats();

      if (stats.heapUsagePercent > 85) {
        if (this.areLogsEnabled) {
          this.logger.log(
            'High memory usage detected, performing garbage collection...',
          );
        }
        const success = this.memoryManager.forceGarbageCollection();

        if (success && this.areLogsEnabled) {
          // Check memory after GC
          const newStats = this.memoryManager.getMemoryStats();
          this.logger.log(
            `Garbage collection completed. Memory: ${newStats.heapUsed}MB/${newStats.heapTotal}MB (${newStats.heapUsagePercent}%)`,
          );
        }
      }
    } catch (error) {
      if (this.areLogsEnabled) {
        this.logger.error('Garbage collection failed:', error.message);
      }
    }
  }

  /**
   * Emergency memory cleanup when usage is critical
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  emergencyMemoryCleanup() {
    try {
      if (!this.isMonitorEnabled) return;
      if (this.memoryManager.isMemoryCritical()) {
        if (this.areLogsEnabled) {
          this.logger.error('CRITICAL: Emergency memory cleanup triggered');
        }

        // Force garbage collection
        this.memoryManager.forceGarbageCollection();

        // Log current memory state
        const stats = this.memoryManager.getMemoryStats();
        if (this.areLogsEnabled) {
          this.logger.error(
            `Emergency cleanup completed. Memory: ${stats.heapUsed}MB/${stats.heapTotal}MB (${stats.heapUsagePercent}%)`,
          );
        }

        // If still critical after GC, log recommendations
        if (this.areLogsEnabled && stats.isCritical) {
          this.logger.error(
            'Memory still critical after cleanup. Consider restarting application.',
          );
        }
      }
    } catch (error) {
      if (this.areLogsEnabled) {
        this.logger.error('Emergency memory cleanup failed:', error.message);
      }
    }
  }
}
