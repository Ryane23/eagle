import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './config/firebase';
import { EncryptionModule } from './common/services/encryption.module';
import { SmsModule } from './common/services/sms.module';
import { PdfModule } from './common/services/pdf.module';
import { AuditModule } from './common/services/audit.module';
import { EventsModule } from './common/events/events.module';

// Import all feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HospitalsModule } from './modules/hospitals/hospitals.module';
import { PatientsModule } from './modules/patients/patients.module';
import { ConsultationsModule } from './modules/consultations/consultations.module';
import { MessagesModule } from './modules/messages/messages.module';
import { FollowupsModule } from './modules/followups/followups.module';
import { SpecialtiesModule } from './modules/specialties/specialties.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { QueueModule } from './modules/queue/queue.module';
import { UrgenciesModule } from './modules/urgencies/urgencies.module';
import { ReportsModule } from './modules/reports/reports.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { ComplaintsModule } from './modules/complaints/complaints.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SystemModule } from './modules/system/system.module';
import { FilesModule } from './modules/files/files.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { SyncModule } from './modules/sync/sync.module';
import { RulesModule } from './modules/rules/rules.module';
import { PreparationsModule } from './modules/preparations/preparations.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { HelpModule } from './modules/help/help.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { SystemModulesModule } from './modules/system-modules/system-modules.module';
import { VisitsModule } from './modules/visits/visits.module';
import { ConsultationBoxesModule } from './modules/consultation-boxes/consultation-boxes.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    FirebaseModule,
    EncryptionModule,
    SmsModule,
    PdfModule,
    AuditModule,
    EventsModule,
    AuthModule,
    UsersModule,
    HospitalsModule,
    PatientsModule,
    ConsultationsModule,
    MessagesModule,
    FollowupsModule,
    SpecialtiesModule,
    NotificationsModule,
    QueueModule,
    UrgenciesModule,
    ReportsModule,
    PrescriptionsModule,
    ComplaintsModule,
    AnalyticsModule,
    SystemModule,
    FilesModule,
    TicketsModule,
    SyncModule,
    RulesModule,
    PreparationsModule,
    PermissionsModule,
    ActivitiesModule,
    CalendarModule,
    HelpModule,
    ReferralsModule,
    SystemModulesModule,
    VisitsModule,
    ConsultationBoxesModule,
    AppointmentsModule,
    SchedulingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
