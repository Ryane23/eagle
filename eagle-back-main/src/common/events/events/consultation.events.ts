export class ConsultationScheduledEvent {
  constructor(
    public readonly consultationId: string,
    public readonly patientId: string,
    public readonly doctorId: string,
    public readonly scheduledAt: Date,
  ) {}
}

export class ConsultationStartedEvent {
  constructor(
    public readonly consultationId: string,
    public readonly patientId: string,
    public readonly doctorId: string,
  ) {}
}

export class ConsultationCompletedEvent {
  constructor(
    public readonly consultationId: string,
    public readonly patientId: string,
    public readonly doctorId: string,
  ) {}
}

