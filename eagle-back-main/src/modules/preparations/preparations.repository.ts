import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/config/firebase';
import {
  Preparation,
  PreparationCollection,
  PreparationStatus,
} from './entities/preparation.entity';

@Injectable()
export class PreparationsRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  async create(preparationData: Partial<Preparation>): Promise<Preparation> {
    const docRef = await this.firebaseService
      .collection(PreparationCollection)
      .add(preparationData);

    const preparation: Preparation = {
      id: docRef.id,
      ...preparationData,
    } as Preparation;

    await docRef.update({ id: docRef.id });

    return preparation;
  }

  async findById(id: string): Promise<Preparation | null> {
    const doc = await this.firebaseService
      .collection(PreparationCollection)
      .doc(id)
      .get();

    if (!doc.exists) {
      return null;
    }

    return { id: doc.id, ...doc.data() } as Preparation;
  }

  async findByNurseId(nurseId: string): Promise<Preparation[]> {
    const snapshot = await this.firebaseService
      .collection(PreparationCollection)
      .where('nurseId', '==', nurseId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Preparation),
    );
  }

  async findActiveByNurseId(nurseId: string): Promise<Preparation[]> {
    const snapshot = await this.firebaseService
      .collection(PreparationCollection)
      .where('nurseId', '==', nurseId)
      .where('status', '==', PreparationStatus.IN_PROGRESS)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Preparation),
    );
  }

  async findByPatientId(patientId: string): Promise<Preparation[]> {
    const snapshot = await this.firebaseService
      .collection(PreparationCollection)
      .where('patientId', '==', patientId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Preparation),
    );
  }

  async findByConsultationId(consultationId: string): Promise<Preparation | null> {
    const snapshot = await this.firebaseService
      .collection(PreparationCollection)
      .where('consultationId', '==', consultationId)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Preparation;
  }

  async update(
    id: string,
    updateData: Partial<Preparation>,
  ): Promise<Preparation | null> {
    const docRef = this.firebaseService
      .collection(PreparationCollection)
      .doc(id);

    await docRef.update(updateData);

    const updated = await docRef.get();
    if (!updated.exists) {
      return null;
    }

    return { id: updated.id, ...updated.data() } as Preparation;
  }

  async delete(id: string): Promise<void> {
    await this.firebaseService
      .collection(PreparationCollection)
      .doc(id)
      .delete();
  }
}
