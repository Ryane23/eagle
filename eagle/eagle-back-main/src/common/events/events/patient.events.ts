export class PatientRegisteredEvent {
  constructor(
    public readonly patientId: string,
    public readonly hospitalId: string,
  ) {}
}

