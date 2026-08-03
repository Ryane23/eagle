import { Test, TestingModule } from '@nestjs/testing';
import { VitalsProcessingService } from './vitals-processing.service';
import { VitalSigns } from '../../modules/patients/entities/vital-signs.interface';

describe('VitalsProcessingService', () => {
  let service: VitalsProcessingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VitalsProcessingService],
    }).compile();

    service = module.get<VitalsProcessingService>(VitalsProcessingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateBMI', () => {
    it('should calculate BMI correctly (normal weight)', () => {
      const bmi = service.calculateBMI(70, 175);
      expect(bmi).toBe(22.9);
    });

    it('should calculate BMI correctly (underweight)', () => {
      const bmi = service.calculateBMI(50, 175);
      expect(bmi).toBe(16.3);
    });

    it('should calculate BMI correctly (overweight)', () => {
      const bmi = service.calculateBMI(85, 175);
      expect(bmi).toBe(27.8);
    });

    it('should calculate BMI correctly (obese)', () => {
      const bmi = service.calculateBMI(100, 175);
      expect(bmi).toBe(32.7);
    });

    it('should handle decimal values', () => {
      const bmi = service.calculateBMI(72.5, 172.5);
      expect(bmi).toBe(24.4);
    });

    it('should return 0 for invalid height', () => {
      const bmi = service.calculateBMI(70, 0);
      expect(bmi).toBe(0);
    });
  });

  describe('processVitals - Integration Tests', () => {
    it('should process vitals with all normal values', () => {
      const vitals: VitalSigns = {
        bloodPressureSystolic: 118,
        bloodPressureDiastolic: 76,
        heartRate: 72,
        temperature: 36.8,
        oxygenSaturation: 98,
        weight: 70,
        height: 175,
        respiratoryRate: 16,
        glycemia: 0.9,
      };

      const result = service.processVitals(vitals);

      expect(result.bmi).toBe(22.9);
      expect(result.alerts).toHaveLength(0);
      expect(result).toMatchObject(vitals);
    });

    it('should detect single critical alert (hypertensive crisis)', () => {
      const vitals: VitalSigns = {
        bloodPressureSystolic: 190,
        bloodPressureDiastolic: 125,
        heartRate: 72,
        temperature: 36.8,
        oxygenSaturation: 98,
        weight: 70,
        height: 175,
        respiratoryRate: 16,
        glycemia: 0.9,
      };

      const result = service.processVitals(vitals);

      expect(result.bmi).toBe(22.9);
      expect(result.alerts).toHaveLength(1);
      expect(result.alerts[0].type).toBe('HYPERTENSION_CRISIS');
      expect(result.alerts[0].severity).toBe('CRITICAL');
    });

    it('should detect multiple alerts from different systems', () => {
      const vitals: VitalSigns = {
        bloodPressureSystolic: 165,
        bloodPressureDiastolic: 100,
        heartRate: 110,
        temperature: 38.5,
        oxygenSaturation: 89,
        weight: 95,
        height: 170,
        respiratoryRate: 25,
        glycemia: 1.4,
      };

      const result = service.processVitals(vitals);

      expect(result.bmi).toBe(32.9);
      expect(result.alerts.length).toBeGreaterThan(3);
      
      const alertTypes = result.alerts.map((a) => a.type);
      expect(alertTypes).toContain('HYPERTENSION_STAGE_2');
      expect(alertTypes).toContain('TACHYCARDIA');
      expect(alertTypes).toContain('FEVER');
      expect(alertTypes).toContain('HYPOXEMIA');
      expect(alertTypes).toContain('OBESITY');
      expect(alertTypes).toContain('TACHYPNEA');
      expect(alertTypes).toContain('HYPERGLYCEMIA');
    });

    it('should handle vitals without optional fields', () => {
      const vitals: VitalSigns = {
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        heartRate: 75,
        temperature: 37.0,
        oxygenSaturation: 98,
        weight: 70,
        height: 175,
      };

      const result = service.processVitals(vitals);

      expect(result.bmi).toBe(22.9);
      expect(result.alerts).toHaveLength(0);
      expect(result.respiratoryRate).toBeUndefined();
      expect(result.glycemia).toBeUndefined();
    });

    it('should detect underweight and hypothermia', () => {
      const vitals: VitalSigns = {
        bloodPressureSystolic: 110,
        bloodPressureDiastolic: 70,
        heartRate: 68,
        temperature: 35.2,
        oxygenSaturation: 98,
        weight: 48,
        height: 170,
        respiratoryRate: 14,
        glycemia: 0.85,
      };

      const result = service.processVitals(vitals);

      expect(result.bmi).toBe(16.6);
      
      const alertTypes = result.alerts.map((a) => a.type);
      expect(alertTypes).toContain('UNDERWEIGHT');
      expect(alertTypes).toContain('HYPOTHERMIA');
    });

    it('should detect bradycardia and bradypnea', () => {
      const vitals: VitalSigns = {
        bloodPressureSystolic: 115,
        bloodPressureDiastolic: 75,
        heartRate: 52,
        temperature: 36.5,
        oxygenSaturation: 97,
        weight: 65,
        height: 168,
        respiratoryRate: 9,
        glycemia: 0.9,
      };

      const result = service.processVitals(vitals);

      const alertTypes = result.alerts.map((a) => a.type);
      expect(alertTypes).toContain('BRADYCARDIA');
      expect(alertTypes).toContain('BRADYPNEA');
    });

    it('should handle zero height edge case', () => {
      const vitals: VitalSigns = {
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        heartRate: 72,
        temperature: 36.8,
        oxygenSaturation: 98,
        weight: 70,
        height: 0,
      };

      const result = service.processVitals(vitals);

      expect(result.bmi).toBeUndefined();
      expect(result.alerts).toHaveLength(0);
    });
  });
});
