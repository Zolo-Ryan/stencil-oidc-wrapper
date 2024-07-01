import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationRolesService } from './application-roles.service';
import { PrismaService } from '../../prisma/prisma.service';
import { HeaderAuthService } from '../../header-auth/header-auth.service';
import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { RoleDto, UpdateRoleDto } from '../application.dto';
import { ResponseDto } from '../../dto/response.dto';
import { Logger } from '@nestjs/common';

describe('ApplicationRolesService', () => {
  let service: ApplicationRolesService;
  let prismaService: PrismaService;
  let headerAuthService: HeaderAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationRolesService,
        {
          provide: PrismaService,
          useValue: {
            application: {
              findUnique: jest.fn(),
            },
            applicationRole: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: HeaderAuthService,
          useValue: {
            validateRoute: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ApplicationRolesService>(ApplicationRolesService);
    prismaService = module.get<PrismaService>(PrismaService);
    headerAuthService = module.get<HeaderAuthService>(HeaderAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRole', () => {
    const mockHeaders = {};
    const mockRoleDto: RoleDto = {
      description: 'Test role',
      name: 'TestRole',
      isDefault: false,
      isSuperRole: false,
    };
    const mockApplicationId = 'app-id';
    const mockRoleId = 'role-id';
    const mockApplicationRes = {
      id: mockApplicationId,
      accessTokenSigningKeysId: 'string',
      active: true,
      data: 'string',
      idTokenSigningKeysId: 'string',
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'string',
      tenantId: 'string',
    };
    const mockApplicationResponse = {
      id: mockRoleId,
      description: 'Test role',
      name: 'TestRole',
      isDefault: false,
      isSuperRole: false,
      applicationsId: mockApplicationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    it('should create a new role successfully', async () => {
      jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
        success: true,
        data: {
          id: 'api-key-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          keyManager: true, 
          keyValue: 'some-key-value',
          permissions: 'some-permissions', 
          metaData: 'some-metadata',
          tenantsId: null,
        },
        message: 'Valid',
      });
      jest
        .spyOn(prismaService.application, 'findUnique')
        .mockResolvedValue(mockApplicationRes);
      jest.spyOn(prismaService.applicationRole, 'create').mockResolvedValue(mockApplicationResponse);

      const result = await service.createRole(
        mockRoleDto,
        mockApplicationId,
        mockRoleId,
        mockHeaders,
      );

      expect(result).toEqual({
        success: true,
        message: 'successfully created a new role',
        data: {
          newRole: {
            id: mockRoleId,
            description: 'Test role',
            name: 'TestRole',
            isDefault: false,
            isSuperRole: false,
            applicationsId: mockApplicationId,
          },
          applicationsId: mockApplicationId,
        },
      });
    });

    it('should throw UnauthorizedException if validateRoute fails', async () => {
      jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
        success: false,
        message: 'Unauthorized',
      });

      await expect(
        service.createRole(
          mockRoleDto,
          mockApplicationId,
          mockRoleId,
          mockHeaders,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if no data is provided', async () => {
      jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
        success: true,
        data: {
          id: 'api-key-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          keyManager: true, 
          keyValue: 'some-key-value',
          permissions: 'some-permissions', 
          metaData: 'some-metadata',
          tenantsId: null,
        },
        message: 'Valid',
      });

      await expect(
        service.createRole(null, mockApplicationId, mockRoleId, mockHeaders),
      ).rejects.toThrow(BadRequestException);
    });

    // Add other test cases for different scenarios...
  });

  describe('getRole', () => {
    const mockHeaders = {};
    const mockApplicationId = 'app-id';
    const mockRoleId = 'role-id';
    const mockRoleApplicationRes = {
      id: mockApplicationId,
      accessTokenSigningKeysId : 'access-token-id',
      active : true,
      data : 'data',
      idTokenSigningKeysId : 'token-signing-id',
      createdAt : new Date(),
      updatedAt : new Date(),
      name : 'name',
      tenantId: 'tenant-id',
    }
    const mockApplicationRoleRes = {
      id: mockRoleId,
      applicationsId: mockApplicationId,
      description: 'Test role',
      createdAt : new Date(),
      isDefault: false,
      isSuperRole: false,
      updatedAt : new Date(),
      name: 'TestRole',
    }
    it('should return role successfully', async () => {
      jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
        success: true,
        data: {
          id: 'api-key-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          keyManager: true, 
          keyValue: 'some-key-value',
          permissions: 'some-permissions', 
          metaData: 'some-metadata',
          tenantsId: null,
        },
        message: 'Valid',
      });
      jest.spyOn(prismaService.application, 'findUnique').mockResolvedValue(mockRoleApplicationRes);
      jest
        .spyOn(prismaService.applicationRole, 'findUnique')
        .mockResolvedValue(mockApplicationRoleRes);

      const result = await service.getRole(
        mockApplicationId,
        mockRoleId,
        mockHeaders,
      );

      expect(result).toEqual({
        success: true,
        message: 'role found',
        data: {
          id: mockRoleId,
          description: 'Test role',
          name: 'TestRole',
          isDefault: false,
          isSuperRole: false,
          applicationsId: mockApplicationId,
        },
      });
    });

    it('should throw UnauthorizedException if validateRoute fails', async () => {
      jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
        success: false,
        message: 'Unauthorized',
      });

      await expect(
        service.getRole(mockApplicationId, mockRoleId, mockHeaders),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if no application id is provided', async () => {
      jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
        success: true,
        data: {
          id: 'api-key-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          keyManager: true, 
          keyValue: 'some-key-value',
          permissions: 'some-permissions', 
          metaData: 'some-metadata',
          tenantsId: null,
        },
        message: 'Valid',
      });

      await expect(
        service.getRole(null, mockRoleId, mockHeaders),
      ).rejects.toThrow(BadRequestException);
    });

    // Add other test cases for different scenarios...
  });

  describe('updateRole', () => {
    const mockHeaders = {};
    const mockApplicationId = 'app-id';
    const mockRoleId = 'role-id';
    const mockUpdateRoleDto: UpdateRoleDto = {
      description: 'Updated description',
    };
    const mockRoleApplicationRes = {
      id: mockApplicationId,
      accessTokenSigningKeysId : 'access-token-id',
      active : true,
      data : 'data',
      idTokenSigningKeysId : 'token-signing-id',
      createdAt : new Date(),
      updatedAt : new Date(),
      name : 'name',
      tenantId: 'tenant-id',
    }
    const mockApplicationRoleUpdateRes = {
      id: mockRoleId,
      applicationsId: mockApplicationId,
      description: 'Updated description',
      createdAt : new Date(),
      isDefault: false,
      isSuperRole: false,
      updatedAt : new Date(),
      name: 'TestRole',
    }
    it('should update role successfully', async () => {
      jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
        success: true,
        data: {
          id: 'api-key-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          keyManager: true, 
          keyValue: 'some-key-value',
          permissions: 'some-permissions', 
          metaData: 'some-metadata',
          tenantsId: null,
        },
        message: 'Valid',
      });
      jest.spyOn(prismaService.application, 'findUnique').mockResolvedValue(mockRoleApplicationRes);
      jest.spyOn(prismaService.applicationRole, 'update').mockResolvedValue(mockApplicationRoleUpdateRes);

      const result = await service.updateRole(
        mockApplicationId,
        mockRoleId,
        mockUpdateRoleDto,
        mockHeaders,
      );

      expect(result).toEqual({
        success: true,
        message: 'role updated successfully',
        data: {
          id: mockRoleId,
          description: 'Updated description',
          name: 'TestRole',
          isDefault: false,
          isSuperRole: false,
          applicationsId: mockApplicationId,
        },
      });
    });

    it('should throw UnauthorizedException if validateRoute fails', async () => {
      jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
        success: false,
        message: 'Unauthorized',
      });

      await expect(
        service.updateRole(
          mockApplicationId,
          mockRoleId,
          mockUpdateRoleDto,
          mockHeaders,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if no data is provided', async () => {
      jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
        success: true,
        data: {
          id: 'api-key-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          keyManager: true, 
          keyValue: 'some-key-value',
          permissions: 'some-permissions', 
          metaData: 'some-metadata',
          tenantsId: null,
        },
        message: 'Valid',
      });

      await expect(
        service.updateRole(mockApplicationId, mockRoleId, null, mockHeaders),
      ).rejects.toThrow(BadRequestException);
    });

    // Add other test cases for different scenarios...
  });

  describe('deleteRole', () => {
    const mockHeaders = {};
    const mockApplicationId = 'app-id';
    const mockRoleId = 'role-id';
    const mockRoleApplicationRes = {
      id: mockApplicationId,
      accessTokenSigningKeysId : 'access-token-id',
      active : true,
      data : 'data',
      idTokenSigningKeysId : 'token-signing-id',
      createdAt : new Date(),
      updatedAt : new Date(),
      name : 'name',
      tenantId: 'tenant-id',
    }
    // type '{ id: string; applicationsId: string; description: string; createdAt: Date; isDefault: boolean; isSuperRole: boolean; updatedAt: Date; name: string; }': createdAt, updatedAt
    const mockApplicationRoleDeleteRes = {
      id: mockRoleId,
      applicationsId: mockApplicationId,
      description: 'Test role',
      createdAt : new Date(),
      isDefault: false,
      isSuperRole: false,
      updatedAt : new Date(),
      name: 'TestRole',
    }
    it('should delete role successfully', async () => {
      jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
        success: true,
        data: {
          id: 'api-key-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          keyManager: true, 
          keyValue: 'some-key-value',
          permissions: 'some-permissions', 
          metaData: 'some-metadata',
          tenantsId: null,
        },
        message: 'Valid',
      });
      jest.spyOn(prismaService.application, 'findUnique').mockResolvedValue(mockRoleApplicationRes);
      jest.spyOn(prismaService.applicationRole, 'delete').mockResolvedValue(mockApplicationRoleDeleteRes);

      const result = await service.deleteRole(
        mockApplicationId,
        mockRoleId,
        mockHeaders,
      );

      expect(result).toEqual({
        success: true,
        message: 'role deleted successfully',
        data: {
          id: mockRoleId,
          description: 'Test role',
          name: 'TestRole',
          isDefault: false,
          isSuperRole: false,
          applicationsId: mockApplicationId,
        },
      });
    });

    it('should throw UnauthorizedException if validateRoute fails', async () => {
      jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
        success: false,
        message: 'Unauthorized',
      });

      await expect(
        service.deleteRole(mockApplicationId, mockRoleId, mockHeaders),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if no application id is provided', async () => {
      jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
        success: true,
        data: {
          id: 'api-key-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          keyManager: true, 
          keyValue: 'some-key-value',
          permissions: 'some-permissions', 
          metaData: 'some-metadata',
          tenantsId: null,
        },
        message: 'Valid',
      });

      await expect(
        service.deleteRole(null, mockRoleId, mockHeaders),
      ).rejects.toThrow(BadRequestException);
    });

    // Add other test cases for different scenarios...
  });
});
