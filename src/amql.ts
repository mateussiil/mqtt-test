import amqplib, { ConsumeMessage } from "amqplib";

export class RabbitMqConnect {
  private amqpConn: amqplib.Connection | null = null;
  private subChannel: amqplib.ConfirmChannel | null = null;
  private url: string;

  constructor(url: string) {
    this.url = url
  }

  async connect() {
    await amqplib.connect(this.url + "?heartbeat=60")
      .then(async (connection: amqplib.Connection) => {
        console.log('[AMQP] connected')
        this.amqpConn = connection

        await this.startSubscriber()
      })
      .catch((err:any) => {
        if (err) {
          console.error("[AMQP]", err.message);
          return setTimeout(() => this.connect(), 7000);
        }

        if (err.message !== "Connection closing") {
          console.error("[AMQP] conn error", err.message);
          return setTimeout(() => this.connect(), 7000);
        }
      });
  }

  async startSubscriber() {
    if (!this.amqpConn) throw Error('No connection');

    this.subChannel = await this.amqpConn.createConfirmChannel();

    this.subChannel.on("error", function (err:any) {
      console.error("[AMQP] channel error", err.message);
    });

    this.subChannel.on("close", function () {
      console.log("[AMQP] channel closed");
    });
  }

  sendToQueue(queue: string, content: any) {
    this.createQueue(queue)
      .then(channel => channel.sendToQueue(queue, Buffer.from(JSON.stringify(content))))
      .catch(err => {
        console.error("[AMQP] sendToQueue", err.message);
      })
  }

  consume(queue: string, onMessage: (msg: ConsumeMessage | null) => void) {
    this.createQueue(queue)
      .then(channel => channel.consume(queue, onMessage, { noAck: true }))
      .catch(err => console.log(err));
  }

  createQueue(queue: string): Promise<amqplib.ConfirmChannel> {

    return new Promise((resolve, reject) => {
      try {
        if (!this.subChannel) throw Error('No channel');

        this.subChannel.assertQueue(queue, { durable: true });
        resolve(this.subChannel);
      }
      catch (err) { reject(err) }
    });
  }
}