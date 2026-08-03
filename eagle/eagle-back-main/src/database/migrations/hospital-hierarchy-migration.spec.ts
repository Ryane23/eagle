import { HospitalType } from '../../modules/hospitals/entities/hospital.entity';
import { buildHospitalHierarchyMigrationPlan } from './hospital-hierarchy-migration';

describe('buildHospitalHierarchyMigrationPlan', () => {
  it('normalizes a legacy tree when exactly one PRIMARY exists', () => {
    const plan = buildHospitalHierarchyMigrationPlan([
      { id: 'primary-1', code: 'YDE', type: HospitalType.PRIMARY },
      { id: 'sub-1', code: 'DLA', type: 'SECONDARY' },
    ]);

    expect(plan.errors).toEqual([]);
    expect(plan.updates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'primary-1',
          changes: { parentHospitalId: null },
        }),
        expect.objectContaining({
          id: 'sub-1',
          changes: {
            type: HospitalType.SUB,
            parentHospitalId: 'primary-1',
          },
          parentWasInferred: true,
        }),
      ]),
    );
  });

  it('is idempotent for an already valid hierarchy', () => {
    const plan = buildHospitalHierarchyMigrationPlan([
      {
        id: 'primary-1',
        code: 'YDE',
        type: HospitalType.PRIMARY,
        parentHospitalId: null,
      },
      {
        id: 'sub-1',
        code: 'DLA',
        type: HospitalType.SUB,
        parentHospitalId: 'primary-1',
      },
    ]);

    expect(plan.errors).toEqual([]);
    expect(plan.updates).toEqual([]);
    expect(plan.unchanged).toEqual(['primary-1', 'sub-1']);
  });

  it('reports ambiguity instead of choosing between multiple PRIMARY hospitals', () => {
    const plan = buildHospitalHierarchyMigrationPlan([
      {
        id: 'primary-1',
        type: HospitalType.PRIMARY,
        parentHospitalId: null,
      },
      {
        id: 'primary-2',
        type: HospitalType.PRIMARY,
        parentHospitalId: null,
      },
      { id: 'sub-1', type: 'SECONDARY' },
    ]);

    expect(plan.errors).toHaveLength(1);
    expect(plan.updates).toEqual([]);
  });

  it('uses an explicit code-based parent map when networks are ambiguous', () => {
    const plan = buildHospitalHierarchyMigrationPlan(
      [
        {
          id: 'primary-1',
          code: 'YDE',
          type: HospitalType.PRIMARY,
          parentHospitalId: null,
        },
        {
          id: 'primary-2',
          code: 'DLA-P',
          type: HospitalType.PRIMARY,
          parentHospitalId: null,
        },
        { id: 'sub-1', code: 'DLA', type: 'SECONDARY' },
      ],
      { DLA: 'DLA-P' },
    );

    expect(plan.errors).toEqual([]);
    expect(plan.updates).toContainEqual(
      expect.objectContaining({
        id: 'sub-1',
        changes: {
          type: HospitalType.SUB,
          parentHospitalId: 'primary-2',
        },
        parentWasInferred: false,
      }),
    );
  });
});
