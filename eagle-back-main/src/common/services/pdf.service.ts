import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { FirebaseService } from 'src/config/firebase';
import { PatientCollection } from 'src/modules/patients/entities/patient.entity';
import { UserCollection } from 'src/modules/users/entities/user.entity';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  /**
   * Generate prescription PDF
   */
  async generatePrescriptionPdf(prescriptionId: string): Promise<Buffer> {
    // TODO: Fetch prescription data from database
    // For now, return a basic PDF structure

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('PRESCRIPTION', { align: 'center' });
      doc.moveDown();

      // Prescription details
      doc.fontSize(12);
      doc.text(`Prescription ID: ${prescriptionId}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      // Placeholder for prescription content
      doc.text('Prescription details will be populated from database', {
        align: 'left',
      });

      doc.end();
    });
  }

  /**
   * Generate consultation report PDF
   */
  async generateConsultationReportPdf(consultationId: string): Promise<Buffer> {
    // TODO: Fetch consultation data from database

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('CONSULTATION REPORT', { align: 'center' });
      doc.moveDown();

      // Report details
      doc.fontSize(12);
      doc.text(`Consultation ID: ${consultationId}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      // Placeholder for report content
      doc.text('Consultation report details will be populated from database', {
        align: 'left',
      });

      doc.end();
    });
  }

  /**
   * Generate exam voucher PDF
   */
  async generateExamVoucherPdf(
    patientId: string,
    exams: string[],
    laboratoryInfo?: string,
  ): Promise<Buffer> {
    // Fetch patient data
    const patientDoc = await this.firebaseService
      .collection(PatientCollection)
      .doc(patientId)
      .get();

    const patientData = patientDoc.exists ? patientDoc.data() : null;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('EXAM VOUCHER', { align: 'center' });
      doc.moveDown();

      // Patient information
      doc.fontSize(12);
      if (patientData) {
        doc.text(
          `Patient: ${patientData.firstName || ''} ${patientData.lastName || ''}`,
        );
        doc.text(`ID Number: ${patientData.idNumber || 'N/A'}`);
      }
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      // Required exams
      doc.fontSize(14).text('Required Exams:', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      exams.forEach((exam, index) => {
        doc.text(`${index + 1}. ${exam}`);
      });
      doc.moveDown();

      // Laboratory information
      if (laboratoryInfo) {
        doc.fontSize(14).text('Laboratory Information:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12);
        doc.text(laboratoryInfo);
      }

      // Validity period
      doc.moveDown();
      const validityDate = new Date();
      validityDate.setDate(validityDate.getDate() + 30); // 30 days validity
      doc.text(`Valid until: ${validityDate.toLocaleDateString()}`);

      doc.end();
    });
  }

  /**
   * Generate ticket PDF
   */
  async generateTicketPdf(
    ticketNumber: string,
    patientName: string,
    queuePosition?: number,
    estimatedWaitTime?: number,
    consultationTime?: Date,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: [300, 400] });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Header
      doc.fontSize(18).text('EAGLE TICKET', { align: 'center' });
      doc.moveDown();

      // Ticket number (large)
      doc.fontSize(24).text(ticketNumber, { align: 'center' });
      doc.moveDown();

      // Patient name
      doc.fontSize(12);
      doc.text(`Patient: ${patientName}`);
      doc.moveDown(0.5);

      // Queue information
      if (queuePosition !== undefined) {
        doc.text(`Queue Position: ${queuePosition}`);
      }
      if (estimatedWaitTime !== undefined) {
        doc.text(`Estimated Wait: ${estimatedWaitTime} minutes`);
      }
      if (consultationTime) {
        doc.text(
          `Consultation Time: ${consultationTime.toLocaleString()}`,
        );
      }

      // QR code placeholder (would need to embed actual QR code image)
      doc.moveDown();
      doc.text('QR Code: [Image would be embedded here]', {
        align: 'center',
      });

      doc.end();
    });
  }

  /**
   * Generate PDF with custom content
   */
  async generateCustomPdf(
    title: string,
    content: string,
    metadata?: Record<string, string>,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Title
      doc.fontSize(20).text(title, { align: 'center' });
      doc.moveDown();

      // Metadata
      if (metadata) {
        doc.fontSize(10);
        Object.entries(metadata).forEach(([key, value]) => {
          doc.text(`${key}: ${value}`);
        });
        doc.moveDown();
      }

      // Content
      doc.fontSize(12);
      doc.text(content);

      doc.end();
    });
  }
}

