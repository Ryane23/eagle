export class PrescriptionCreatedEvent {
  constructor(
    public readonly prescriptionId: string,
    public readonly consultationId: string,
    public readonly patientId: string,
    public readonly doctorId: string,
  ) {}
}

