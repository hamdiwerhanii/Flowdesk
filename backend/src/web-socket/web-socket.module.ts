import { Global, Module } from '@nestjs/common';
import { WebsocketGateway } from './web-socket.gateway';

@Global()
@Module({
  providers: [WebsocketGateway],
  exports: [WebsocketGateway],
})
export class WebSocketModule {}
