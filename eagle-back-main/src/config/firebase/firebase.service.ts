import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService {
  private firestore: admin.firestore.Firestore;

  constructor(private configService: ConfigService) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
          clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
          privateKey: this.configService
            .get<string>('FIREBASE_PRIVATE_KEY')
            ?.replace(/\\n/g, '\n'),
        }),
        databaseURL: `https://${this.configService.get<string>('FIREBASE_PROJECT_ID')}.firebaseio.com`,
      });
    }
    this.firestore = admin.firestore();
    this.firestore.settings({
      databaseId: 'eagles',
      ignoreUndefinedProperties: true, // Firestore rejects undefined; this strips them before write
    });
  }

  getFirestore(): admin.firestore.Firestore {
    return this.firestore;
  }

  getAuth(): admin.auth.Auth {
    return admin.auth();
  }

  getStorage(): admin.storage.Storage {
    return admin.storage();
  }

  collection(collectionName: string): admin.firestore.CollectionReference {
    return this.firestore.collection(collectionName);
  }

  timestamp(): admin.firestore.Timestamp {
    return admin.firestore.Timestamp.now();
  }

  serverTimestamp(): admin.firestore.FieldValue {
    return admin.firestore.FieldValue.serverTimestamp();
  }
}
