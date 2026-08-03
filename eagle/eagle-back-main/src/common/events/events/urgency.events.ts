export class UrgencyCreatedEvent {
  constructor(
    public readonly urgencyId: string,
    public readonly patientId: string,
    public readonly hospitalId: string,
    public readonly level: string,
  ) {}
}

export class UrgencyValidatedEvent {
  constructor(
    public readonly urgencyId: string,
    public readonly validatedBy: string,
    public readonly newLevel: string,
  ) {}
}

export class UrgencyAssignedEvent {
  constructor(
    public readonly urgencyId: string,
    public readonly doctorId: string,
    public readonly scheduledAt: Date,
  ) {}
}

export class UrgencyCompletedEvent {
  constructor(
    public readonly urgencyId: string,
    public readonly consultationId: string,
  ) {}
}

