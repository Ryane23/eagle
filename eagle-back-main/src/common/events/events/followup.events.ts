export class FollowupScheduledEvent {
  constructor(
    public readonly followupId: string,
    public readonly patientId: string,
    public readonly doctorId: string,
    public readonly scheduledAt: Date,
  ) {}
}

