import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MemoryManagerService {
  private readonly logger = new Logger(MemoryManagerService.name);
  // Default thresholds are tuned higher to avoid noise on small heaps (e.g., Render free tier)
  private memoryThreshold = parseInt(
    process.env.MEMORY_WARNING_THRESHOLD || '97',
    10,
  );
  private criticalThreshold = parseInt(
    process.env.MEMORY_CRITICAL_THRESHOLD || '99',
    10,
  );

  /**
   * Get current memory usage statistics
   */
  getMemoryStats() {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const externalMB = Math.round(memUsage.external / 1024 / 1024);
    const rssMB = Math.round(memUsage.rss / 1024 / 1024);

    // Prefer RSS-based utilization if a container/app memory limit is provided
    const memoryLimitMb = parseInt(process.env.MEMORY_LIMIT_MB || '', 10);
    const useRss = !!memoryLimitMb || process.env.MEMORY_USE_RSS === 'true';

    const usagePercent =
      useRss && memoryLimitMb
        ? Math.round((rssMB / memoryLimitMb) * 100)
        : Math.round((heapUsedMB / Math.max(heapTotalMB, 1)) * 100);

    return {
      heapUsed: heapUsedMB,
      heapTotal: heapTotalMB,
      heapUsagePercent: usagePercent, // represents selected metric (RSS-based if configured)
      external: externalMB,
      rss: rssMB,
      isWarning: usagePercent > this.memoryThreshold,
      isCritical: usagePercent > this.criticalThreshold,
    };
  }

  /**
   * Check if memory usage is critical
   */
  isMemoryCritical(): boolean {
    const stats = this.getMemoryStats();
    return stats.isCritical;
  }

  /**
   * Force garbage collection if available
   */
  forceGarbageCollection() {
    if (global.gc) {
      try {
        global.gc();
        this.logger.log('Garbage collection forced');
        return true;
      } catch (error) {
        this.logger.error('Failed to force garbage collection:', error.message);
        return false;
      }
    } else {
      this.logger.warn(
        'Garbage collection not available. Start with --expose-gc flag',
      );
      return false;
    }
  }

  /**
   * Monitor memory usage and log warnings
   */
  monitorMemoryUsage() {
    const stats = this.getMemoryStats();

    if (stats.isCritical) {
      this.logger.error(
        `CRITICAL: Memory usage at ${stats.heapUsagePercent}% (${stats.heapUsed}MB/${stats.heapTotal}MB)`,
      );

      // Try to force garbage collection
      this.forceGarbageCollection();

      // Log additional memory info
      this.logger.error(
        `External memory: ${stats.external}MB, RSS: ${stats.rss}MB`,
      );
    } else if (stats.isWarning) {
      this.logger.warn(
        `WARNING: Memory usage at ${stats.heapUsagePercent}% (${stats.heapUsed}MB/${stats.heapTotal}MB)`,
      );
    }
  }

  /**
   * Get memory usage recommendations
   */
  getMemoryRecommendations() {
    const stats = this.getMemoryStats();
    const recommendations = [];

    if (stats.heapUsagePercent > 90) {
      recommendations.push('CRITICAL: Consider restarting the application');
      recommendations.push('Check for memory leaks in database queries');
      recommendations.push('Review large data processing operations');
    } else if (stats.heapUsagePercent > 80) {
      recommendations.push('WARNING: Monitor memory usage closely');
      recommendations.push('Consider optimizing database queries');
      recommendations.push('Review pagination in large data sets');
    } else if (stats.heapUsagePercent > 70) {
      recommendations.push('INFO: Memory usage is elevated');
      recommendations.push('Monitor for memory leaks');
    }

    return recommendations;
  }

  /**
   * Set memory thresholds
   */
  setThresholds(warning: number, critical: number) {
    this.memoryThreshold = warning;
    this.criticalThreshold = critical;
    this.logger.log(
      `Memory thresholds updated: Warning=${warning}%, Critical=${critical}%`,
    );
  }
}
