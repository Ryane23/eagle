import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { User } from '../users/entities/user.entity';
import { TicketsService } from './tickets.service';
@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly service: TicketsService) {}
  @Post('visit/:visitId')
  create(@Param('visitId') id: string) { return this.service.createForVisit(id); }
  @Get('my-hospital')
  mine(@CurrentUser() user: User) { return this.service.mine(user); }
  @Get('visit/:visitId')
  byVisit(@Param('visitId') id: string, @CurrentUser() user: User) { return this.service.byVisit(id, user); }
  @Get('number/:number')
  byNumber(@Param('number') number: string, @CurrentUser() user: User) { return this.service.byNumber(number, user); }
}
