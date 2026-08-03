import { FirebaseService } from '../../config/firebase';
import { SystemService } from './system.service';

describe('SystemService', () => {
  const set = jest.fn();
  const get = jest.fn();
  const limitGet = jest.fn();
  const add = jest.fn();
  const orderBy = jest.fn(() => ({
    limit: jest.fn(() => ({ get: limitGet })),
  }));
  const firebaseService = {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({ get, set })),
      limit: jest.fn(() => ({ get: limitGet })),
      add,
      orderBy,
    })),
  };
  const service = new SystemService(
    firebaseService as unknown as FirebaseService,
  );

  beforeEach(() => {
    jest.resetAllMocks();
    firebaseService.collection.mockImplementation(() => ({
      doc: jest.fn(() => ({ get, set })),
      limit: jest.fn(() => ({ get: limitGet })),
      add,
      orderBy,
    }));
    get.mockResolvedValue({ exists: false });
    set.mockResolvedValue(undefined);
    add.mockResolvedValue({ id: 'history-1' });
    limitGet.mockResolvedValue({ empty: true });
  });

  it('returns safe defaults before settings are persisted', async () => {
    await expect(service.getSettings()).resolves.toEqual(
      expect.objectContaining({
        maintenanceMode: false,
        maxUrgencyLevel: 5,
        defaultConsultationDuration: 30,
      }),
    );
  });

  it('persists and returns the toggled maintenance state', async () => {
    get
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({ maintenanceMode: false }),
      })
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({ maintenanceMode: true }),
      });

    await expect(service.toggleMaintenance()).resolves.toEqual({
      isMaintenanceMode: true,
      message: 'EAGLE is currently in maintenance mode',
    });
    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({ maintenanceMode: true }),
      { merge: true },
    );
  });

  it('reports a healthy database after a successful probe', async () => {
    await expect(service.getHealth()).resolves.toEqual(
      expect.objectContaining({
        status: 'healthy',
        database: 'healthy',
      }),
    );
  });
});
