import { Injectable } from '@nestjs/common';

export interface VitalAlert {
  type: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
}

export interface ProcessedVitals {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  respiratoryRate?: number;
  glycemia?: number;
  bmi?: number;
  alerts: VitalAlert[];
}

@Injectable()
export class VitalsProcessingService {
  /**
   * Calculate BMI from weight and height
   */
  calculateBMI(weight: number, height: number): number {
    if (!weight || !height || height === 0) {
      return 0;
    }
    const heightInMeters = height / 100;
    return parseFloat((weight / Math.pow(heightInMeters, 2)).toFixed(1));
  }

  /**
   * Get BMI category
   */
  getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  /**
   * Check blood pressure and generate alerts
   */
  private checkBloodPressure(
    systolic?: number,
    diastolic?: number,
  ): VitalAlert[] {
    const alerts: VitalAlert[] = [];

    if (!systolic || !diastolic) {
      return alerts;
    }

    // Hypertension stages
    if (systolic >= 180 || diastolic >= 120) {
      alerts.push({
        type: 'HYPERTENSION_CRISIS',
        severity: 'CRITICAL',
        message: `Hypertensive Crisis (${systolic}/${diastolic} mmHg) - Immediate medical attention required!`,
      });
    } else if (systolic >= 140 || diastolic >= 90) {
      if (systolic >= 160 || diastolic >= 100) {
        alerts.push({
          type: 'HYPERTENSION_STAGE_2',
          severity: 'WARNING',
          message: `Stage 2 Hypertension (${systolic}/${diastolic} mmHg)`,
        });
      } else {
        alerts.push({
          type: 'HYPERTENSION_STAGE_1',
          severity: 'WARNING',
          message: `Stage 1 Hypertension (${systolic}/${diastolic} mmHg)`,
        });
      }
    } else if (systolic >= 120 && systolic < 130 && diastolic < 80) {
      alerts.push({
        type: 'ELEVATED_BP',
        severity: 'INFO',
        message: `Elevated Blood Pressure (${systolic}/${diastolic} mmHg)`,
      });
    }

    // Hypotension
    if (systolic < 90 || diastolic < 60) {
      alerts.push({
        type: 'HYPOTENSION',
        severity: 'WARNING',
        message: `Low Blood Pressure (${systolic}/${diastolic} mmHg)`,
      });
    }

    return alerts;
  }

  /**
   * Check heart rate and generate alerts
   */
  private checkHeartRate(heartRate?: number): VitalAlert[] {
    const alerts: VitalAlert[] = [];

    if (!heartRate) {
      return alerts;
    }

    if (heartRate > 100) {
      alerts.push({
        type: 'TACHYCARDIA',
        severity: heartRate > 120 ? 'WARNING' : 'INFO',
        message: `Elevated Heart Rate (${heartRate} bpm)`,
      });
    } else if (heartRate < 60) {
      alerts.push({
        type: 'BRADYCARDIA',
        severity: heartRate < 50 ? 'WARNING' : 'INFO',
        message: `Low Heart Rate (${heartRate} bpm)`,
      });
    }

    return alerts;
  }

  /**
   * Check temperature and generate alerts
   */
  private checkTemperature(temperature?: number): VitalAlert[] {
    const alerts: VitalAlert[] = [];

    if (!temperature) {
      return alerts;
    }

    if (temperature >= 38.0) {
      alerts.push({
        type: 'FEVER',
        severity: temperature >= 39.0 ? 'WARNING' : 'INFO',
        message: `Fever (${temperature}°C)`,
      });
    } else if (temperature < 36.0) {
      alerts.push({
        type: 'HYPOTHERMIA',
        severity: temperature < 35.0 ? 'WARNING' : 'INFO',
        message: `Low Temperature (${temperature}°C)`,
      });
    }

    return alerts;
  }

  /**
   * Check oxygen saturation and generate alerts
   */
  private checkOxygenSaturation(oxygenSaturation?: number): VitalAlert[] {
    const alerts: VitalAlert[] = [];

    if (!oxygenSaturation) {
      return alerts;
    }

    if (oxygenSaturation < 90) {
      alerts.push({
        type: 'HYPOXEMIA',
        severity: oxygenSaturation < 85 ? 'CRITICAL' : 'WARNING',
        message: `Low Oxygen Saturation (${oxygenSaturation}%)`,
      });
    }

    return alerts;
  }

  /**
   * Check BMI and generate alerts
   */
  private checkBMI(bmi?: number): VitalAlert[] {
    const alerts: VitalAlert[] = [];

    if (!bmi) {
      return alerts;
    }

    const category = this.getBMICategory(bmi);

    if (bmi < 18.5) {
      alerts.push({
        type: 'UNDERWEIGHT',
        severity: 'INFO',
        message: `BMI ${bmi} - ${category}`,
      });
    } else if (bmi >= 30) {
      alerts.push({
        type: 'OBESITY',
        severity: 'WARNING',
        message: `BMI ${bmi} - ${category}`,
      });
    } else if (bmi >= 25) {
      alerts.push({
        type: 'OVERWEIGHT',
        severity: 'INFO',
        message: `BMI ${bmi} - ${category}`,
      });
    }

    return alerts;
  }

  /**
   * Check respiratory rate and generate alerts
   */
  private checkRespiratoryRate(respiratoryRate?: number): VitalAlert[] {
    const alerts: VitalAlert[] = [];

    if (!respiratoryRate) {
      return alerts;
    }

    if (respiratoryRate > 20) {
      alerts.push({
        type: 'TACHYPNEA',
        severity: respiratoryRate > 24 ? 'WARNING' : 'INFO',
        message: `Elevated Respiratory Rate (${respiratoryRate}/min)`,
      });
    } else if (respiratoryRate < 12) {
      alerts.push({
        type: 'BRADYPNEA',
        severity: respiratoryRate < 10 ? 'WARNING' : 'INFO',
        message: `Low Respiratory Rate (${respiratoryRate}/min)`,
      });
    }

    return alerts;
  }

  /**
   * Check glycemia and generate alerts
   */
  private checkGlycemia(glycemia?: number): VitalAlert[] {
    const alerts: VitalAlert[] = [];

    if (!glycemia) {
      return alerts;
    }

    // Glycemia in g/L (normal: 0.7-1.1 g/L)
    if (glycemia > 1.26) {
      alerts.push({
        type: 'HYPERGLYCEMIA',
        severity: glycemia > 2.0 ? 'WARNING' : 'INFO',
        message: `High Blood Sugar (${glycemia} g/L)`,
      });
    } else if (glycemia < 0.6) {
      alerts.push({
        type: 'HYPOGLYCEMIA',
        severity: glycemia < 0.5 ? 'CRITICAL' : 'WARNING',
        message: `Low Blood Sugar (${glycemia} g/L)`,
      });
    }

    return alerts;
  }

  /**
   * Process vital signs and generate alerts
   */
  processVitals(vitals: any): ProcessedVitals {
    const alerts: VitalAlert[] = [];

    // Calculate BMI if weight and height are provided
    let bmi: number | undefined;
    if (vitals.weight && vitals.height) {
      bmi = this.calculateBMI(vitals.weight, vitals.height);
    }

    // Check all vital signs
    alerts.push(...this.checkBloodPressure(vitals.bloodPressureSystolic, vitals.bloodPressureDiastolic));
    alerts.push(...this.checkHeartRate(vitals.heartRate));
    alerts.push(...this.checkTemperature(vitals.temperature));
    alerts.push(...this.checkOxygenSaturation(vitals.oxygenSaturation));
    alerts.push(...this.checkBMI(bmi));
    alerts.push(...this.checkRespiratoryRate(vitals.respiratoryRate));
    alerts.push(...this.checkGlycemia(vitals.glycemia));

    return {
      ...vitals,
      bmi,
      alerts,
    };
  }
}
