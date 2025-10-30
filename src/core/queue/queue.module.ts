import { Module } from '@nestjs/common';
import IORedis from 'ioredis';
import { Queue, Worker } from 'bullmq';
import { EmailService } from '../services/email.service';
import { CoreModule } from '../core.module';

@Module({
  imports: [CoreModule],
  providers: [
    {
      provide: 'REDIS_CONNECTION',
      useFactory: () => {
        const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
        return new IORedis(url, {
          // Required by BullMQ for blocking commands used by workers
          maxRetriesPerRequest: null,
          // Optional but recommended to reduce startup waits in some envs
          enableReadyCheck: false,
        } as any);
      },
    },
    {
      provide: 'EMAIL_QUEUE',
      useFactory: (conn: IORedis) => {
        return new Queue('email', { connection: conn });
      },
      inject: ['REDIS_CONNECTION'],
    },
    // Email worker (runs in-process)
    {
      provide: 'EMAIL_WORKER',
      useFactory: (conn: IORedis, emailService: EmailService) => {
        const worker = new Worker(
          'email',
          async (job) => {
            const { to, subject, html, userId, type, data } = job.data || {};
            const ok = await emailService.sendEmail(
              to,
              { subject, html },
              userId,
              type,
              data,
            );
            if (!ok) {
              throw new Error('Email send failed');
            }
          },
          { connection: conn },
        );
        return worker;
      },
      inject: ['REDIS_CONNECTION', EmailService],
    },
  ],
  exports: ['EMAIL_QUEUE'],
})
export class QueueModule {}
