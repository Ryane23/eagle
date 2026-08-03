import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { TicketsRepository } from '../tickets/tickets.repository';
import { SchedulingService } from './scheduling.service';

@Controller('scheduling')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchedulingController {
  constructor(
    private readonly service: SchedulingService,
    private readonly tickets: TicketsRepository,
  ) {}

  @Post('tickets/:ticketId/retry')
  @Roles(UserRole.ADMIN, UserRole.PRIMARY_SECRETARY)
  async retry(@Param('ticketId') ticketId: string) {
    const ticket = await this.tickets.findById(ticketId);
    if (!ticket) return null;
    await this.service.schedule(ticket);
    return { scheduled: true };
  }
}
