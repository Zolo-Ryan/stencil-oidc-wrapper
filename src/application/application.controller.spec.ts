import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { ApplicationRolesService } from './application-roles/application-roles.service';
import { ApplicationScopesService } from './application-scopes/application-scopes.service';
import { ParamApplicationIdGuard } from '../guards/paramApplicationId.guard';
import { UtilsService } from '../utils/utils.service'; // Adjust this path as per your application structure
import {
  CreateApplicationDto,
  UpdateApplicationDto,
  RoleDto,
  ScopeDto,
} from './application.dto';
import { ResponseDto } from '../dto/response.dto';
import { randomUUID } from 'crypto';

describe('ApplicationController', () => {
  let controller: ApplicationController;
  let applicationService: ApplicationService;
  let applicationRoleService: ApplicationRolesService;
  let applicationScopeService: ApplicationScopesService;

  // MOCK CREATE-APPLICATION-DTO
  const mockCreateApplicationDto = {
    active: true,
    name: 'Mock Application',
    scopes: [
      {
        defaultConsentDetail: 'Default consent detail example',
        defaultConsentMessage: 'Default consent message example',
        name: 'Mock Scope',
        required: true,
        id: '550e8400-e29b-41d4-a716-446655440000',
      },
    ],
    roles: [
      {
        description: 'Admin role with full permissions',
        isDefault: true,
        isSuperRole: false,
        name: 'Admin',
        id: '550e8400-e29b-41d4-a716-446655440000',
      },
    ],
    jwtConfiguration: {
      accessTokenSigningKeysID: 'access-key-id-123',
      refreshTokenTimeToLiveInMinutes: 1440,
      timeToLiveInSeconds: 3600,
      idTokenSigningKeysID: 'id-key-id-456',
    },
    oauthConfiguration: {
      authorizedOriginURLs: [
        'https://example.com',
        'https://anotherexample.com',
      ],
      authorizedRedirectURLs: [
        'https://example.com/callback',
        'https://anotherexample.com/callback',
      ],
      clientSecret: 'supersecret',
      enabledGrants: ['authorization_code', 'refresh_token'],
      logoutURL: 'https://example.com/logout',
    },
  };

  const mockApplicationService = {
    returnAllApplications: jest.fn(),
    createApplication: jest.fn(),
    returnAnApplication: jest.fn(),
    patchApplication: jest.fn(),
    deleteApplication: jest.fn(),
    returnOauthConfiguration: jest.fn(),
  };

  const mockApplicationRolesService = {
    createRole: jest.fn(),
    deleteRole: jest.fn(),
    updateRole: jest.fn(),
  };

  const mockApplicationScopesService = {
    createScope: jest.fn(),
    deleteScope: jest.fn(),
    updateScope: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationController],
      providers: [
        { provide: ApplicationService, useValue: mockApplicationService },
        {
          provide: ApplicationRolesService,
          useValue: {
            createRole: jest.fn(),
            updateRole: jest.fn(),
            deleteRole: jest.fn(),
          },
        },
        {
          provide: ApplicationScopesService,
          useValue: {
            createScope: jest.fn(),
            updateScope: jest.fn(),
            deleteScope: jest.fn(),
          },
        },
        ParamApplicationIdGuard,
        UtilsService, // Mock or provide UtilsService as needed
      ],
    }).compile();

    // Retrieve instances of the controller and services from the testing module
    controller = module.get<ApplicationController>(ApplicationController);
    applicationService = module.get<ApplicationService>(ApplicationService);
    applicationRoleService = module.get<ApplicationRolesService>(
      ApplicationRolesService,
    );
    applicationScopeService = module.get<ApplicationScopesService>(
      ApplicationScopesService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /application', () => {
    it('should return all applications', async () => {
      const headers = {}; // provide headers if needed
      const mockResponse: ResponseDto = {
        success: true,
        message: 'All applications found',
        data: [], // mock your data here if needed
      };
      jest
        .spyOn(applicationService, 'returnAllApplications')
        .mockResolvedValue(mockResponse);

      const result = await controller.allApplications(headers);
      expect(result).toEqual(mockResponse);
    });
  });

  const createApplicationDtoMock: CreateApplicationDto = {
    active: true,
    name: 'Test Application',
    scopes: [
      {
        defaultConsentDetail: 'Default consent detail',
        defaultConsentMessage: 'Default consent message',
        name: 'Scope Name',
        required: true,
      },
    ],
    roles: [
      {
        description: 'Role description',
        isDefault: true,
        isSuperRole: false,
        name: 'Role Name',
      },
    ],
    oauthConfiguration: {
      authorizedOriginURLs: ['https://example.com'],
      authorizedRedirectURLs: ['https://example.com/callback'],
      clientSecret: 'supersecret',
      enabledGrants: ['authorization_code'],
      logoutURL: 'https://example.com/logout',
    },
  };

  describe('POST /application', () => {
    it('should create an application with random UUID', async () => {
      const headers = {}; // provide headers if needed
      const createDto = createApplicationDtoMock;
      const mockResponse: ResponseDto = {
        success: true,
        message: 'Application created successfully',
        data: [], // mock your data here if needed
      };
      jest
        .spyOn(applicationService, 'createApplication')
        .mockResolvedValue(mockResponse);

      expect(
        await controller.createAnApplicationWithRandomUUID(
          mockCreateApplicationDto,
          {},
        ),
      ).toBe(result);
    });
  });

  describe('GET /application/:applicationId', () => {
    it('should return an application by ID', async () => {
      const headers = {}; // provide headers if needed
      const applicationId = 'mock-application-id';
      const mockResponse: ResponseDto = {
        success: true,
        message: 'Application found successfully',
        data: {}, // mock your data here if needed
      };
      jest
        .spyOn(applicationService, 'returnAnApplication')
        .mockResolvedValue(mockResponse);

      const result = await controller.getAnApplication(applicationId, headers);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createAnApplication', () => {
    it('should create an application with given ID', async () => {
      const result: ResponseDto = {
        success: true,
        message: 'Application created successfully',
        data: { id: 'given-id', ...mockCreateApplicationDto },
      };
      jest
        .spyOn(applicationService, 'createApplication')
        .mockResolvedValue(result);

      expect(
        await controller.createAnApplication(
          mockCreateApplicationDto,
          'given-id',
          {},
        ),
      ).toBe(result);
    });
  });

  describe('updateApplication', () => {
    it('should update an application', async () => {
      const headers = {}; // provide headers if needed
      const applicationId = 'mock-application-id';
      const updateDto: UpdateApplicationDto = {}; // provide data for UpdateApplicationDto
      const mockResponse: ResponseDto = {
        success: true,
        message: 'Application updated successfully',
        data: {}, // mock your data here if needed
      };
      jest
        .spyOn(applicationService, 'patchApplication')
        .mockResolvedValue(mockResponse);

      expect(
        await controller.updateApplication(
          'given-id',
          mockCreateApplicationDto,
          {},
        ),
      ).toBe(result);
    });
  });

  describe('DELETE /application/:applicationId', () => {
    it('should delete an application', async () => {
      const headers = {}; // provide headers if needed
      const applicationId = 'mock-application-id';
      const hardDelete = false; // or true based on your test case
      const mockResponse: ResponseDto = {
        success: true,
        message: 'Application deleted Successfully!',
        data: {}, // mock your data here if needed
      };
      jest
        .spyOn(applicationService, 'deleteApplication')
        .mockResolvedValue(mockResponse);

      const result = await controller.deleteApplication(
        applicationId,
        hardDelete,
        headers,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  const roleDtoMock: RoleDto = {
    description: 'Admin role with full permissions',
    isDefault: true,
    isSuperRole: false,
    name: 'Admin',
  };

  describe('POST /application/:applicationId/role', () => {
    it('should create a role for an application with random UUID', async () => {
      const headers = {}; // provide headers if needed
      const applicationId = 'mock-application-id';
      const createDto = roleDtoMock;
      const mockResponse: ResponseDto = {
        success: true,
        message: 'Role created successfully',
        data: {}, // mock your data here if needed
      };
      jest
        .spyOn(applicationRoleService, 'createRole')
        .mockResolvedValue(mockResponse);

      expect(
        await controller.createRoleWithRandomUUID('app-id', mockRoleDto, {}),
      ).toBe(result);
    });
  });

  describe('POST /application/:applicationId/role/:roleId', () => {
    it('should create a role for an application with given ID', async () => {
      const headers = {}; // provide headers if needed
      const applicationId = 'mock-application-id';
      const roleId = 'mock-role-id';
      const createDto = roleDtoMock;
      const mockResponse: ResponseDto = {
        success: true,
        message: 'Role created successfully',
        data: {}, // mock your data here if needed
      };
      jest
        .spyOn(applicationRoleService, 'createRole')
        .mockResolvedValue(mockResponse);

      const result = await controller.createRole(
        applicationId,
        roleId,
        createDto,
        headers,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('PATCH /application/:applicationId/role/:roleId', () => {
    it('should update a role for an application', async () => {
      const headers = {}; // provide headers if needed
      const applicationId = 'mock-application-id';
      const roleId = 'mock-role-id';
      const updateDto = roleDtoMock;
      const mockResponse: ResponseDto = {
        success: true,
        message: 'Role updated successfully',
        data: {}, // mock your data here if needed
      };
      jest
        .spyOn(applicationRoleService, 'updateRole')
        .mockResolvedValue(mockResponse);

      const result = await controller.updateRole(
        applicationId,
        roleId,
        updateDto,
        headers,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('DELETE /application/:applicationId/role/:roleId', () => {
    it('should delete a role from an application', async () => {
      const headers = {}; // provide headers if needed
      const applicationId = 'mock-application-id';
      const roleId = 'mock-role-id';
      const mockResponse: ResponseDto = {
        success: true,
        message: 'Role deleted successfully',
        data: {}, // mock your data here if needed
      };
      jest
        .spyOn(applicationRoleService, 'deleteRole')
        .mockResolvedValue(mockResponse);

      const result = await controller.deleteRole(
        applicationId,
        roleId,
        headers,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  const scopeDtoMock: ScopeDto = {
    defaultConsentDetail: 'Default consent detail example',
    defaultConsentMessage: 'Default consent message example',
    name: 'Scope name example',
    required: true,
  };

  describe('POST /application/:applicationId/scope', () => {
    it('should create a scope for an application with random UUID', async () => {
      const headers = {}; // provide headers if needed
      const applicationId = 'mock-application-id';
      const createDto: ScopeDto = scopeDtoMock;
      const mockResponse: ResponseDto = {
        success: true,
        message: 'Scope created successfully',
        data: {}, // mock your data here if needed
      };
      jest
        .spyOn(applicationScopeService, 'createScope')
        .mockResolvedValue(mockResponse);

      const result = await controller.createScopeWithRandomUUID(
        applicationId,
        createDto,
        headers,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('POST /application/:applicationId/scope/:scopeId', () => {
    it('should create a scope for an application with given ID', async () => {
      const headers = {}; // provide headers if needed
      const applicationId = 'mock-application-id';
      const scopeId = 'mock-scope-id';
      const createDto = scopeDtoMock;
      const mockResponse: ResponseDto = {
        success: true,
        message: 'Scope created successfully',
        data: {}, // mock your data here if needed
      };
      jest
        .spyOn(applicationScopeService, 'createScope')
        .mockResolvedValue(mockResponse);

      expect(
        await controller.createScope(
          'app-id',
          'given-scope-id',
          mockScopeDto,
          {},
        ),
      ).toBe(result);
    });
  });

  describe('PATCH /application/:applicationId/scope/:scopeId', () => {
    it('should update a scope for an application', async () => {
      const headers = {}; // provide headers if needed
      const applicationId = 'mock-application-id';
      const scopeId = 'mock-scope-id';
      const updateDto = scopeDtoMock;
      const mockResponse: ResponseDto = {
        success: true,
        message: 'Scope updated successfully',
        data: {}, // mock your data here if needed
      };
      jest
        .spyOn(applicationScopeService, 'updateScope')
        .mockResolvedValue(mockResponse);

      const result = await controller.updateScope(
        applicationId,
        scopeId,
        updateDto,
        headers,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('DELETE /application/:applicationId/scope/:scopeId', () => {
    it('should delete a scope from an application', async () => {
      const headers = {}; // provide headers if needed
      const applicationId = 'mock-application-id';
      const scopeId = 'mock-scope-id';
      const mockResponse: ResponseDto = {
        success: true,
        message: 'Scope deleted successfully',
        data: {}, // mock your data here if needed
      };
      jest
        .spyOn(applicationScopeService, 'deleteScope')
        .mockResolvedValue(mockResponse);

      expect(
        await controller.updateScope(
          'app-id',
          'given-scope-id',
          mockScopeDto,
          {},
        ),
      ).toBe(result);
    });
  });

  describe('GET /application/:applicationId/oauth-configuration', () => {
    it('should return OAuth configuration for an application by ID', async () => {
      const headers = {}; // provide headers if needed
      const applicationId = 'mock-application-id';
      const mockResponse: ResponseDto = {
        success: true,
        message: "Application's configurations are as follows",
        data: {}, // mock your data here if needed
      };
      jest
        .spyOn(applicationService, 'returnOauthConfiguration')
        .mockResolvedValue(mockResponse);

      const result = await controller.returnOauthConfiguration(
        applicationId,
        headers,
      );
      expect(result).toEqual(mockResponse);
    });
  });
});

// UNIT TESTS: APPLICATION CONTROLLER
// ---------------------------------
// Test 1: allApplications
// 1. Call allApplications method
// 2. Expect returnAllApplications method to have been called
// 3. Expect the return value to be the same as the mocked result
// Test 2: createAnApplicationWithRandomUUID
// 1. Call createAnApplicationWithRandomUUID method
// 2. Expect createApplication method to have been called
// 3. Expect the return value to be the same as the mocked result
// Test 3: getAnApplication
// 1. Call getAnApplication method
// 2. Expect returnAnApplication method to have been called
// 3. Expect the return value to be the same as the mocked result
// Test 4: createAnApplication
// 1. Call createAnApplication method
// 2. Expect createApplication method to have been called
// 3. Expect the return value to be the same as the mocked result
// Test 5: updateApplication
// 1. Call updateApplication method
// 2. Expect patchApplication method to have been called
// 3. Expect the return value to be the same as the mocked result
// Test 6: deleteApplication
// 1. Call deleteApplication method
// 2. Expect deleteApplication method to have been called
// 3. Expect the return value to be the same as the mocked result
// Test 7: createRoleWithRandomUUID
// 1. Call createRoleWithRandomUUID method
// 2. Expect createRole method to have been called
// 3. Expect the return value to be the same as the mocked result
// Test 8: createRole
// 1. Call createRole method
// 2. Expect createRole method to have been called
// 3. Expect the return value to be the same as the mocked result
// Test 9: deleteRole
// 1. Call deleteRole method
// 2. Expect deleteRole method to have been called
// 3. Expect the return value to be the same as the mocked result
// Test 10: updateRole
// 1. Call updateRole method
// 2. Expect updateRole method to have been called
// 3. Expect the return value to be the same as the mocked result
// Test 11: createScopeWithRandomUUID
// 1. Call createScopeWithRandomUUID method
// 2. Expect createScope method to have been called
// 3. Expect the return value to be the same as the mocked result
// Test 12: createScope
// 1. Call createScope method
// 2. Expect createScope method to have been called
// 3. Expect the return value to be the same as the mocked result
// Test 13: deleteScope
// 1. Call deleteScope method
// 2. Expect deleteScope method to have been called
// 3. Expect the return value to be the same as the mocked result
// Test 14: updateScope
// 1. Call updateScope method
// 2. Expect updateScope method to have been called
// 3. Expect the return value to be the same as the mocked result
// Test 15: returnOauthConfiguration
// 1. Call returnOauthConfiguration method
// 2. Expect returnOauthConfiguration method to have been called
// 3. Expect the return value to be the same as the mocked result
