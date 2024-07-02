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
import { HeaderAuthService } from 'src/header-auth/header-auth.service';

describe('ApplicationController', () => {
  let controller: ApplicationController;
  let applicationService: ApplicationService;
  let applicationRoleService: ApplicationRolesService;
  let applicationScopeService: ApplicationScopesService;

  beforeEach(async () => {
    const mockApplicationService = {
      returnAllApplications: jest.fn<Promise<ResponseDto>, [object]>(),
    };
    // Create a NestJS testing module to mock and inject dependencies
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationController], // Specify the controller to be tested
      providers: [
        // Mock or provide necessary services
        {
          provide: ApplicationService,
          useValue: {
            returnAllApplications: jest.fn(),
            createApplication: jest.fn(),
            returnAnApplication: jest.fn(),
            patchApplication: jest.fn(),
            deleteApplication: jest.fn(),
            returnOauthConfiguration: jest.fn(),
          },
        },
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
    it('should call applicationService.returnAllApplications with headers', async () => {
      const headers = { authorization: 'Bearer token' };
      await controller.allApplications(headers);
      expect(applicationService.returnAllApplications).toHaveBeenCalledWith(headers);
    });

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
    // it('should throw an error if applicationService.returnAllApplications throws', async () => {
    //   const error = new Error('Test error');
    //   applicationService.returnAllApplications.mockRejectedValue(error)
      
    //   await expect(controller.allApplications({})).rejects.toThrow(error);
    // });

    it('should handle error when fetching applications', async () => {
      const headers = {};
      const error = new Error('Internal Server Error');

      jest.spyOn(applicationService, 'returnAllApplications').mockRejectedValue(error);

      try {
        await controller.allApplications(headers);
      } catch (err) {
        expect(err).toBe(error);
      }
      expect(applicationService.returnAllApplications).toHaveBeenCalledWith(headers);
    });

    it('should handle empty headers', async () => {
      const result: ResponseDto = {
        success : true,
        message: 'All applications found',
        data: [],
      };

      jest.spyOn(applicationService, 'returnAllApplications').mockResolvedValue(result);

      expect(await controller.allApplications(null)).toBe(result);
      expect(applicationService.returnAllApplications).toHaveBeenCalledWith(null);
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
      const mockResponse = {};
      jest
        .spyOn(applicationService, 'createApplication')
        .mockResolvedValue();

      const result = await controller.createAnApplicationWithRandomUUID(
        createDto,
        headers,
        mockResponse as any 
      );
      expect(result).toEqual(mockResponse);
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

  describe('PATCH /application/:applicationId', () => {
    it('should update an application', async () => {
      const headers = {}; // provide headers if needed
      const applicationId = 'mock-application-id';
      const updateDto: UpdateApplicationDto = {}; // provide data for UpdateApplicationDto
      const mockResponse = {};
      jest
        .spyOn(applicationService, 'patchApplication')
        .mockResolvedValue();

      const result = await controller.updateApplication(
        applicationId,
        updateDto,
        headers,
        mockResponse as any 
      );
      expect(result).toEqual(mockResponse);
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

      const result = await controller.createRoleWithRandomUUID(
        applicationId,
        createDto,
        headers,
      );
      expect(result).toEqual(mockResponse);
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

      const result = await controller.createScope(
        applicationId,
        scopeId,
        createDto,
        headers,
      );
      expect(result).toEqual(mockResponse);
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

      const result = await controller.deleteScope(
        applicationId,
        scopeId,
        headers,
      );
      expect(result).toEqual(mockResponse);
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

  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocked functions to reset for the next test
  });
});
