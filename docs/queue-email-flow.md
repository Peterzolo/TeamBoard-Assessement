# Queue Email Flow (BullMQ + Redis)

## Overview
This document explains how background email sending works using a Redis-backed queue. It covers the producer, the queue, and the worker, including where each piece lives in the codebase and how jobs are retried with backoff.

## Components

- Producer (adds jobs): `src/modules/users/services/users.service.ts`
- Queue + Redis connection + Worker: `src/core/queue/queue.module.ts`
- Email delivery: `src/core/services/email.service.ts`
- Templates: `src/core/templates/email/*`

## Environment

- Redis URL: `REDIS_URL=redis://localhost:6379`

## Installation (already done)

- Deps: `bullmq`, `ioredis`
- Ensure Redis server is running (local, WSL, Memurai, or managed cloud)

## High-Level Flow

1) API receives a request to invite a user (`POST /api/v1/users/invite`).
2) `UsersService.createInvitedUser` generates a verification token and email template.
3) Instead of sending email inline, it enqueues a job on the `email` queue with retry/backoff options.
4) The `EMAIL_WORKER` (BullMQ Worker) listens to the `email` queue and processes jobs asynchronously.
5) The worker calls `EmailService.sendEmail(...)`. On failure, BullMQ retries according to configured attempts/backoff.

## Producer (where jobs are added)

File: `src/modules/users/services/users.service.ts`

Key injection:
```
constructor(
  ...,
  @Inject('EMAIL_QUEUE') private readonly emailQueue: Queue,
) {}
```

Adding the job (both branches in `createInvitedUser`):
```
await this.emailQueue.add(
  'send-email',
  {
    to: inviteDto.email,
    subject: template.subject,
    html: template.html,
    type: 'email_verification',
    data: { email: inviteDto.email },
  },
  { attempts: 5, backoff: { type: 'exponential', delay: 5000 } },
);
```

Notes:
- `attempts: 5` → up to 5 tries
- `backoff` → exponential with 5s base delay

## Queue and Worker (where jobs are processed)

File: `src/core/queue/queue.module.ts`

Redis connection provider:
```
{
  provide: 'REDIS_CONNECTION',
  useFactory: () => new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379'),
}
```

Queue provider:
```
{
  provide: 'EMAIL_QUEUE',
  useFactory: (conn: IORedis) => new Queue('email', { connection: conn }),
  inject: ['REDIS_CONNECTION'],
}
```

Worker provider:
```
{
  provide: 'EMAIL_WORKER',
  useFactory: (conn: IORedis, emailService: EmailService) => {
    return new Worker(
      'email',
      async (job) => {
        const { to, subject, html, userId, type, data } = job.data || {};
        const ok = await emailService.sendEmail(to, { subject, html }, userId, type, data);
        if (!ok) throw new Error('Email send failed');
      },
      { connection: conn },
    );
  },
  inject: ['REDIS_CONNECTION', EmailService],
}
```

This worker runs in-process with the main app. For higher throughput or isolation, you can run workers in a separate NestJS process later.

## Module Wiring

- `QueueModule` is imported into `UsersModule`:
  - File: `src/modules/users/users.module.ts`
  - Ensures `EMAIL_QUEUE` is available to `UsersService`

## Error Handling & User Feedback

- If email provider fails, the job is retried by the worker.
- The invite API completes quickly; the user is not blocked by email delivery.
- If enqueue fails (e.g., Redis down), the HTTP request will error at the enqueue step; handle with a friendly message if desired.

## Observability

- Logs from `EmailService` and Worker show successes/failures.
- You can add a dashboard (e.g., `bull-board`) later to monitor queues.

## Future Enhancements

- Dedicated worker service/process
- Separate queues for different notification types
- Dead-letter queue for permanently failed jobs
- Metrics/alerts on failure rates and latency

## Troubleshooting

- Connection refused: ensure Redis is running and `REDIS_URL` is correct.
- Jobs stuck in waiting: verify worker is created (QueueModule is imported) and no Redis auth issues.
- Emails not delivered: check provider credentials and logs in `EmailService`.


