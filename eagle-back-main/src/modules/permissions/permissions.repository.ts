import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/config/firebase';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { Permission, PermissionCollection } from './entities/permission.entity';
import { RolePermissions, RolePermissionsCollection } from './entities/role.entity';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class PermissionsRepository extends BaseRepository<Permission> {
  constructor(protected readonly firebaseService: FirebaseService) {
    super(firebaseService, PermissionCollection);
  }

  async findActive(): Promise<Permission[]> {
    const snapshot = await this.firebaseService
      .collection(PermissionCollection)
      .where('isActive', '==', true)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Permission));
  }

  async findByResource(resource: string): Promise<Permission[]> {
    const snapshot = await this.firebaseService
      .collection(PermissionCollection)
      .where('resource', '==', resource)
      .where('isActive', '==', true)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Permission));
  }

  async findByName(name: string): Promise<Permission | null> {
    const snapshot = await this.firebaseService
      .collection(PermissionCollection)
      .where('name', '==', name)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Permission;
  }

  // Role Permissions
  async getRolePermissions(role: UserRole): Promise<RolePermissions | null> {
    const snapshot = await this.firebaseService
      .collection(RolePermissionsCollection)
      .where('role', '==', role)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as RolePermissions;
  }

  async setRolePermissions(rolePermissions: Partial<RolePermissions>): Promise<RolePermissions> {
    const existingSnapshot = await this.firebaseService
      .collection(RolePermissionsCollection)
      .where('role', '==', rolePermissions.role)
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      // Update existing
      const doc = existingSnapshot.docs[0];
      await doc.ref.update({
        ...rolePermissions,
        updatedAt: new Date(),
      });
      const updated = await doc.ref.get();
      return { id: updated.id, ...updated.data() } as RolePermissions;
    } else {
      // Create new
      const docRef = await this.firebaseService
        .collection(RolePermissionsCollection)
        .add({
          ...rolePermissions,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      const created = await docRef.get();
      return { id: created.id, ...created.data() } as RolePermissions;
    }
  }

  async getAllRolePermissions(): Promise<RolePermissions[]> {
    const snapshot = await this.firebaseService
      .collection(RolePermissionsCollection)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as RolePermissions));
  }
}
