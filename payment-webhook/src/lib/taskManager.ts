import { PrismaClient, TaskStatus } from '@prisma/client';
import { Client } from 'pg';

const prisma = new PrismaClient();

export class TaskManager {
  private pg: Client;
  private queueName: string;

  constructor(pg: Client, queueName: string) {
    this.pg = pg;
    this.queueName = queueName;
  }

  async init() {
    await this.pg.connect();
    await this.pg.query(`SELECT * FROM pgmq.create($1::text);`, [this.queueName]);
  }

  async createTask(paymentEventId: number) {
    const log = await prisma.paymentTaskLog.create({
      data: {
        paymentEventId,
        status: TaskStatus.PENDING,
      },
    });

    const msg = { paymentEventId };

    const result = await this.pg.query(
      `SELECT pgmq.send($1::text, $2::jsonb) as msg_id;`,
      [this.queueName, JSON.stringify(msg)]
    );

    const msgId = result.rows[0]?.msg_id;

    const updatedLog = await prisma.paymentTaskLog.update({
      where: { id: log.id },
      data: {
        pgmqMessageId: msgId?.toString()
      },
    });

    return updatedLog;
  }

  async getNextTask() {
    const res = await this.pg.query(
      `SELECT * FROM pgmq.read($1::text, 1, 30);`,
      [this.queueName]
    );

    if (res.rows.length === 0) return null;

    const row = res.rows[0];

    return {
      msgId: row.msg_id?.toString(),
      readCount: Number(row.read_ct),
      enqueuedAt: row.enqueued_at,
      payload: row.message,
    };
  }

  async ackTask(msgId: number | string) {
    await this.pg.query(
      `SELECT pgmq.delete($1::text, $2::bigint);`,
      [this.queueName, msgId]
    );
  }

  async updateTaskLog(logId: string, status: TaskStatus, message?: string) {
    return prisma.paymentTaskLog.update({
      where: { id: logId },
      data: { status, message },
    });
  }
}
