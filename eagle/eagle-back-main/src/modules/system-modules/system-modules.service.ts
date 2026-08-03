import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../../config/firebase';
import {
  HospitalModuleConfig,
  HospitalModuleConfigCollection,
  ModuleCategory,
  SystemModule,
  SystemModuleCollection,
} from './entities/system-module.entity';
import {
  CreateSystemModuleDto,
  UpdateHospitalModuleConfigDto,
  UpdateSystemModuleDto,
} from './dto';

@Injectable()
export class SystemModulesService {
  constructor(private readonly firebaseService: FirebaseService) {}

  private moduleCollection() {
    return this.firebaseService.collection(SystemModuleCollection);
  }

  private configCollection() {
    return this.firebaseService.collection(HospitalModuleConfigCollection);
  }

  private toModule(id: string, data: FirebaseFirestore.DocumentData): SystemModule {
    return { id, ...data } as SystemModule;
  }

  private toConfig(id: string, data: FirebaseFirestore.DocumentData): HospitalModuleConfig {
    return { id, ...data } as HospitalModuleConfig;
  }

  async create(dto: CreateSystemModuleDto, createdBy: string): Promise<SystemModule> {
    const ref = this.moduleCollection().doc();
    const now = new Date();
    const module: SystemModule = {
      ...dto,
      id: ref.id,
      isEnabled: true,
      createdBy,
      createdAt: now,
      updatedAt: now,
    };
    await ref.set(module);
    return module;
  }

  async findAll(): Promise<SystemModule[]> {
    const snapshot = await this.moduleCollection().get();
    return snapshot.docs
      .map(doc => this.toModule(doc.id, doc.data()))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  async findEnabled(): Promise<SystemModule[]> {
    const snapshot = await this.moduleCollection().where('isEnabled', '==', true).get();
    return snapshot.docs.map(doc => this.toModule(doc.id, doc.data()));
  }

  async findCoreModules(): Promise<SystemModule[]> {
    const snapshot = await this.moduleCollection().where('isCore', '==', true).get();
    return snapshot.docs.map(doc => this.toModule(doc.id, doc.data()));
  }

  async findByCategory(category: ModuleCategory): Promise<SystemModule[]> {
    const snapshot = await this.moduleCollection().where('category', '==', category).get();
    return snapshot.docs.map(doc => this.toModule(doc.id, doc.data()));
  }

  async findById(id: string): Promise<SystemModule> {
    const doc = await this.moduleCollection().doc(id).get();
    if (!doc.exists) throw new NotFoundException(`System module ${id} not found`);
    return this.toModule(doc.id, doc.data()!);
  }

  async update(id: string, dto: UpdateSystemModuleDto, updatedBy: string): Promise<SystemModule> {
    await this.findById(id);
    const data = { ...dto, updatedAt: new Date(), updatedBy };
    await this.moduleCollection().doc(id).update(data);
    return this.findById(id);
  }

  async toggleEnabled(id: string, updatedBy: string): Promise<SystemModule> {
    const module = await this.findById(id);
    return this.update(id, { isEnabled: !module.isEnabled }, updatedBy);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.moduleCollection().doc(id).delete();
  }

  async getAllHospitalConfigs(hospitalId: string): Promise<HospitalModuleConfig[]> {
    const snapshot = await this.configCollection().where('hospitalId', '==', hospitalId).get();
    return snapshot.docs.map(doc => this.toConfig(doc.id, doc.data()));
  }

  async getHospitalConfig(hospitalId: string, moduleId: string): Promise<HospitalModuleConfig | null> {
    const snapshot = await this.configCollection()
      .where('hospitalId', '==', hospitalId)
      .where('moduleId', '==', moduleId)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return this.toConfig(doc.id, doc.data());
  }

  async getHospitalModules(hospitalId: string): Promise<SystemModule[]> {
    const [modules, configs] = await Promise.all([
      this.findEnabled(),
      this.getAllHospitalConfigs(hospitalId),
    ]);
    const configByModule = new Map(configs.map(config => [config.moduleId, config]));
    return modules
      .filter(module => configByModule.get(module.id)?.isEnabled ?? true)
      .map(module => ({
        ...module,
        isEnabled: configByModule.get(module.id)?.isEnabled ?? module.isEnabled,
      }));
  }

  async isModuleEnabledForHospital(hospitalId: string, moduleId: string): Promise<boolean> {
    const config = await this.getHospitalConfig(hospitalId, moduleId);
    if (config) return config.isEnabled;
    return (await this.findById(moduleId)).isEnabled;
  }

  async updateHospitalConfig(
    dto: UpdateHospitalModuleConfigDto,
    updatedBy: string,
  ): Promise<HospitalModuleConfig> {
    await this.findById(dto.moduleId);
    const existing = await this.getHospitalConfig(dto.hospitalId, dto.moduleId);
    const now = new Date();
    const data = { ...dto, updatedBy, updatedAt: now };

    if (existing) {
      await this.configCollection().doc(existing.id).update(data);
      return this.toConfig(existing.id, { ...existing, ...data });
    }

    const ref = this.configCollection().doc();
    const config: HospitalModuleConfig = {
      ...dto,
      id: ref.id,
      createdAt: now,
      updatedAt: now,
    };
    await ref.set(config);
    return config;
  }

  async resetHospitalConfig(hospitalId: string, moduleId: string): Promise<void> {
    const config = await this.getHospitalConfig(hospitalId, moduleId);
    if (config) await this.configCollection().doc(config.id).delete();
  }
}
