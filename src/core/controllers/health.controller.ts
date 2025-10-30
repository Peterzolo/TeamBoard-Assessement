import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class HealthController {
  @Get()
  getHealthCheck() {
    return {
      message: 'Server Is Running',
      status: 'success',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  @Get('health')
  getDetailedHealthCheck() {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const heapUsagePercent = Math.round((heapUsedMB / heapTotalMB) * 100);

    // Check if memory usage is critical (above 80%)
    const isMemoryCritical = heapUsagePercent > 80;
    const status = isMemoryCritical ? 'warning' : 'ok';

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        used: heapUsedMB,
        total: heapTotalMB,
        usagePercent: heapUsagePercent,
        isCritical: isMemoryCritical,
        external: Math.round(memUsage.external / 1024 / 1024), // External memory
        rss: Math.round(memUsage.rss / 1024 / 1024), // Resident Set Size
      },
      warnings: isMemoryCritical ? ['High memory usage detected'] : [],
    };
  }

  @Get('favicon.ico')
  getFavicon(@Res() res: Response) {
    // Return a 204 No Content response for favicon requests
    // This prevents the 404 error in logs
    res.status(204).send();
  }
}
