import mqtt from 'mqtt';
import { RabbitMqConnect } from './amql';

// Configurações do broker MQTT
const MQTT_BROKER = 'mqtt://emqx@127.0.0.1';
const MQTT_TOPIC = 'testtopic/#';

// Conecta-se ao broker MQTT
const client = mqtt.connect(MQTT_BROKER);

const amqUrl = process.env.AMQP_URL || 'amqp://guest:guest@localhost:5672';
const queue = 'mqtt-message'
const rabbitmq = new RabbitMqConnect(amqUrl);

// Lida com a conexão estabelecida
client.on('connect', async () => {
  await rabbitmq.connect();

  console.log('Conexão estabelecida com o broker MQTT.');
  // Inscreva-se em um tópico
  client.subscribe(MQTT_TOPIC, (err) => {
    if (!err) {
      console.log('Inscrito no tópico:', MQTT_TOPIC);
    }
  });
});

// Lida com mensagens recebidas
client.on('message', async (topic, message) => {
  rabbitmq.sendToQueue(queue, message.toString())
  console.log('Mensagem recebida:', message.toString());
});

// Lida com erros de conexão
client.on('error', (error) => {
  console.error('Erro de conexão:', error);
});
