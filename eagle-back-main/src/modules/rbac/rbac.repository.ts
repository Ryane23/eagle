import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/config/firebase';
import { BaseRepository } from 'src/common/repositories/base.repository';
import {
  Permission,
  RolePermission,
  PermissionCollection,
  RolePermissionCollection,
} from './entities/permission.entity';

@Injectable()
export class PermissionsRepository extends BaseRepository<Permission> {
  constructor(firebaseService: FirebaseService) {
    super(firebaseService, PermissionCollection);
  }

  async findByResource(resource: string): Promise<Permission[]> {
    const snapshot = await this.collection
      .where('resource', '==', resource)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Permission[];
  }

  async findByResourceAndAction(
    resource: string,
    action: string,
  ): Promise<Permission | null> {
    const snapshot = await this.collection
      .where('resource', '==', resource)
      .where('action', '==', action)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Permission;
  }
}

@Injectable()
export class RolePermissionsRepository extends BaseRepository<RolePermission> {
  constructor(firebaseService: FirebaseService) {
    super(firebaseService, RolePermissionCollection);
  }

  async findByRole(roleId: string): Promise<RolePermission[]> {
    const snapshot = await this.collection.where('roleId', '==', roleId).get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as RolePermission[];
  }

  async findByPermission(permissionId: string): Promise<RolePermission[]> {
    const snapshot = await this.collection
      .where('permissionId', '==', permissionId)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as RolePermission[];
  }

  async findByRoleAndPermission(
    roleId: string,
    permissionId: string,
  ): Promise<RolePermission | null> {
    const snapshot = await this.collection
      .where('roleId', '==', roleId)
      .where('permissionId', '==', permissionId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as RolePermission;
  }

  async deleteByRole(roleId: string): Promise<void> {
    const snapshot = await this.collection.where('roleId', '==', roleId).get();

    const batch = this.collection.firestore.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }

  async deleteByPermission(permissionId: string): Promise<void> {
    const snapshot = await this.collection
      .where('permissionId', '==', permissionId)
      .get();

    const batch = this.collection.firestore.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }
}
