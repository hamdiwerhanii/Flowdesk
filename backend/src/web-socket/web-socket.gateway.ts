import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MembershipStatus, Role } from '@prisma/client';
import type { Namespace, Socket } from 'socket.io';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { ACCESS_COOKIE, readCookie } from '../auth/utils/cookies.util';
import { STAFF_ROLES } from '../decorators/role.decorator';
import { PrismaService } from '../prisma/prisma.service';
import {
  CommentEventPayload,
  rooms,
  SocketEvent,
  TicketEventPayload,
} from './types/events.types';

/** What the handshake middleware stores on `socket.data`. */
type SocketData = { user?: JwtPayload };

// Socket.IO types `socket.data` as any; read it through this typed helper.
const socketData = (socket: Socket): SocketData => socket.data as SocketData;

@WebSocketGateway({ namespace: '/ws', transports: ['websocket', 'polling'] })
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server!: Namespace;

  private readonly logger = new Logger(WebsocketGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /** Authenticates the handshake with the same httpOnly cookie as REST. */
  afterInit(server: Namespace) {
    server.use((socket, next) => {
      const token = readCookie(socket.handshake.headers.cookie, ACCESS_COOKIE);
      if (!token) return next(new Error('Unauthorized'));
      this.jwtService
        .verifyAsync<JwtPayload>(token)
        .then((payload) => {
          socketData(socket).user = payload;
          next();
        })
        .catch(() => next(new Error('Unauthorized')));
    });
  }

  /** Joins the user's room plus one room per ACTIVE membership. */
  async handleConnection(socket: Socket) {
    const user = socketData(socket).user;
    if (!user) return socket.disconnect(true);

    const memberships = await this.prisma.membership.findMany({
      where: { userId: user.sub, status: MembershipStatus.ACTIVE },
      select: { organizationId: true, role: true },
    });

    const joined = [rooms.user(user.sub)];
    for (const { organizationId, role } of memberships) {
      joined.push(rooms.org(organizationId));
      if (STAFF_ROLES.includes(role))
        joined.push(rooms.orgStaff(organizationId));
      if (role === Role.ADMIN) joined.push(rooms.orgAdmins(organizationId));
    }
    await socket.join(joined);
    this.logger.debug(`Socket ${socket.id} joined ${joined.join(', ')}`);
  }

  emitToUser(userId: string, event: SocketEvent, data: unknown) {
    this.server.to(rooms.user(userId)).emit(event, data);
  }

  emitToOrgStaff(orgId: string, event: SocketEvent, data: unknown) {
    this.server.to(rooms.orgStaff(orgId)).emit(event, data);
  }

  emitToOrgAdmins(orgId: string, event: SocketEvent, data: unknown) {
    this.server.to(rooms.orgAdmins(orgId)).emit(event, data);
  }

  /** Staff always hear about a ticket; the requester only if it isn't internal. */
  emitTicketEvent(
    requesterId: string,
    event: SocketEvent,
    data: TicketEventPayload | CommentEventPayload,
    internal = false,
  ) {
    const target = this.server.to(rooms.orgStaff(data.orgId));
    if (internal) return target.emit(event, data);
    target.to(rooms.user(requesterId)).emit(event, data);
  }
}
