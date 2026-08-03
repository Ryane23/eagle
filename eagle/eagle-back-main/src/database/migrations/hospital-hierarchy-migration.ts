import { HospitalType } from '../../modules/hospitals/entities/hospital.entity';

export type LegacyHospital = {
  id: string;
  code?: string;
  name?: string;
  type?: string;
  parentHospitalId?: string | null;
};

export type HospitalHierarchyUpdate = {
  id: string;
  name: string;
  changes: {
    type?: HospitalType;
    parentHospitalId?: string | null;
  };
  parentWasInferred: boolean;
};

export type HospitalHierarchyMigrationPlan = {
  updates: HospitalHierarchyUpdate[];
  unchanged: string[];
  errors: string[];
};

export function buildHospitalHierarchyMigrationPlan(
  hospitals: LegacyHospital[],
  parentMap: Record<string, string> = {},
): HospitalHierarchyMigrationPlan {
  const updates: HospitalHierarchyUpdate[] = [];
  const unchanged: string[] = [];
  const errors: string[] = [];
  const byId = new Map(hospitals.map((hospital) => [hospital.id, hospital]));
  const byCode = new Map<string, LegacyHospital>();

  for (const hospital of hospitals) {
    if (!hospital.code) continue;
    if (byCode.has(hospital.code)) {
      errors.push(`Duplicate hospital code: ${hospital.code}`);
      continue;
    }
    byCode.set(hospital.code, hospital);
  }

  const primaries = hospitals.filter(
    (hospital) => hospital.type === HospitalType.PRIMARY,
  );

  const resolveHospital = (reference?: string | null) => {
    if (!reference) return undefined;
    return byId.get(reference) ?? byCode.get(reference);
  };

  for (const hospital of hospitals) {
    const name = hospital.name ?? hospital.code ?? hospital.id;

    if (hospital.type === HospitalType.PRIMARY) {
      if (hospital.parentHospitalId === null) {
        unchanged.push(hospital.id);
      } else {
        updates.push({
          id: hospital.id,
          name,
          changes: { parentHospitalId: null },
          parentWasInferred: false,
        });
      }
      continue;
    }

    if (hospital.type !== 'SECONDARY' && hospital.type !== HospitalType.SUB) {
      errors.push(`${name}: unsupported hospital type "${hospital.type}"`);
      continue;
    }

    const mappedParentReference =
      parentMap[hospital.id] ??
      (hospital.code ? parentMap[hospital.code] : undefined);
    let parent = resolveHospital(
      mappedParentReference ?? hospital.parentHospitalId,
    );
    let parentWasInferred = false;

    if (!parent && primaries.length === 1) {
      parent = primaries[0];
      parentWasInferred = true;
    }

    if (!parent) {
      errors.push(
        `${name}: no parent could be resolved; provide a parent map when multiple PRIMARY hospitals exist`,
      );
      continue;
    }

    if (parent.id === hospital.id) {
      errors.push(`${name}: a hospital cannot be its own parent`);
      continue;
    }

    if (
      parent.type !== HospitalType.PRIMARY ||
      (parent.parentHospitalId !== null &&
        parent.parentHospitalId !== undefined)
    ) {
      errors.push(
        `${name}: parent ${parent.name ?? parent.id} is not a root PRIMARY hospital`,
      );
      continue;
    }

    const changes: HospitalHierarchyUpdate['changes'] = {};
    if (hospital.type !== HospitalType.SUB) {
      changes.type = HospitalType.SUB;
    }
    if (hospital.parentHospitalId !== parent.id) {
      changes.parentHospitalId = parent.id;
    }

    if (Object.keys(changes).length === 0) {
      unchanged.push(hospital.id);
    } else {
      updates.push({
        id: hospital.id,
        name,
        changes,
        parentWasInferred,
      });
    }
  }

  return { updates, unchanged, errors };
}
