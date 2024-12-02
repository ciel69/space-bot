import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class BattleGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger('BattleGateway');
  private server: Server;

  afterInit(server: Server) {
    this.server = server;
    this.logger.log('WebSocket initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('startBattle')
  handleStartBattle(client: Socket, payload: any) {
    // Начать симуляцию боя, передав стартовую информацию
    this.logger.log('Battle started', payload);
    this.startBattleSimulation(client, payload);
  }

  private async startBattleSimulation(client: Socket, payload: any) {
    // Симуляция боя будет происходить здесь
    let step = 0;

    // Пример симуляции: просто обновляем состояние боя через промежутки времени
    const battleInterval = setInterval(() => {
      if (step >= 5) {
        clearInterval(battleInterval); // Завершаем симуляцию через 5 шагов
        this.server.emit('battleEnded', { message: 'Battle ended' });
      } else {
        // Отправляем обновление состояния для каждого шага
        client.emit('battleUpdate', {
          step,
          message: `Step ${step} of the battle`,
          // Пример данных (информация о состоянии кораблей)
          shipsStatus: [
            { shipId: 'ship1', health: 100 - step * 10 },
            { shipId: 'ship2', health: 100 - step * 15 },
          ],
        });
        step++;
      }
    }, 1000); // Каждый шаг с интервалом в 1 секунду
  }
}
