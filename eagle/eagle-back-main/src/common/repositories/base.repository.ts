import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../config/firebase';
import * as admin from 'firebase-admin';

@Injectable()
export abstract class BaseRepository<T> {
  protected collection: admin.firestore.CollectionReference;

  constructor(
    protected firebaseService: FirebaseService,
    collectionName: string,
  ) {
    this.collection = firebaseService.collection(collectionName);
  }

  /**
   * Create a new document
   */
  async create(data: Partial<T>): Promise<T> {
    const docRef = this.collection.doc();
    const now = this.firebaseService.timestamp().toDate();

    // Filter out undefined values to prevent Firestore errors
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    );

    const newData = {
      ...filteredData,
      id: docRef.id,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(newData);
    return newData as T;
  }

  /**
   * Find document by ID
   */
  async findById(id: string): Promise<T | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as T;
  }

  /**
   * Find all documents
   */
  async findAll(): Promise<T[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
  }

  /**
   * Find documents with query
   */
  async findWhere(
    field: string,
    operator: admin.firestore.WhereFilterOp,
    value: any,
  ): Promise<T[]> {
    const snapshot = await this.collection.where(field, operator, value).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
  }

  /**
   * Update document by ID
   */
  async update(id: string, data: Partial<T>): Promise<T | null> {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return null;

    // Filter out undefined values to prevent Firestore errors
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    );

    const updatedData = {
      ...filteredData,
      updatedAt: this.firebaseService.timestamp().toDate(),
    };

    await docRef.update(updatedData);
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() } as T;
  }

  /**
   * Delete document by ID
   */
  async delete(id: string): Promise<boolean> {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return false;

    await docRef.delete();
    return true;
  }

  /**
   * Find one document by query
   */
  async findOne(
    field: string,
    operator: admin.firestore.WhereFilterOp,
    value: any,
  ): Promise<T | null> {
    const snapshot = await this.collection
      .where(field, operator, value)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as T;
  }

  /**
   * Count documents
   */
  async count(): Promise<number> {
    const snapshot = await this.collection.count().get();
    return snapshot.data().count;
  }
}
