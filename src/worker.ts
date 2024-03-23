import { RabbitMqConnect } from './amql';

const amqUrl = process.env.AMQP_URL || 'amqp://guest:guest@localhost:5672';
const queue = 'mqtt-message'

const randomId = Math.random()

const rabbitmq = new RabbitMqConnect(amqUrl);

(async () => {
  await rabbitmq.connect();
  console.log('run in ', randomId)

  rabbitmq.consume(queue, (message) => {
    console.log(message?.content.toString(), ' from rabbitmq to', randomId)
  });
})()
