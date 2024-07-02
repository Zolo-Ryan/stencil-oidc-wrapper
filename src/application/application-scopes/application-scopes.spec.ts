import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { HeaderAuthService } from '../../header-auth/header-auth.service';
import { UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { RoleDto, ScopeDto, UpdateScopeDto } from '../application.dto';
import { ResponseDto } from '../../dto/response.dto';
import { randomUUID } from 'crypto';
// import faker from 'faker';
import { ApplicationScopesService } from './application-scopes.service';
describe('ApplicationScopesService', () => {
    let service: ApplicationScopesService;
    let prismaService: PrismaService;
    let headerAuthService: HeaderAuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ApplicationScopesService,
                {
                    provide: PrismaService,
                    useValue: {
                        application: {
                            findUnique: jest.fn(),
                        },
                        applicationOauthScope: {
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

        service = module.get<ApplicationScopesService>(ApplicationScopesService);
        prismaService = module.get<PrismaService>(PrismaService);
        headerAuthService = module.get<HeaderAuthService>(HeaderAuthService);
    });

    describe('createScope', () => {
        const mockHeaders = { authorization: 'master', 'x-stencil-tenantid': 'minio-tenant' };
        const mockScopeDto: ScopeDto = {
            id: 'scope-id',
            defaultConsentDetail: 'Testscope',
            defaultConsentMessage: 'ScopeConsentMsg',
            name: randomUUID(),
            required: true
        };
        const mockScopeDtoWithoutID: ScopeDto = {
            defaultConsentDetail: 'Testscope',
            defaultConsentMessage: 'ScopeConsentMsg',
            name: randomUUID(),
            required: true
        };
        const mockApplicationId = "myminioadmin";
        const mockScopeId = 'scope-id';
        const mockApplicationRes = {
            id: mockApplicationId,
            accessTokenSigningKeysId: 'accessTokenSignkeyId',
            active: true,
            data: 'data',
            idTokenSigningKeysId: 'signTokenId',
            createdAt: new Date(),
            updatedAt: new Date(),
            name: 'mockName',
            tenantId: 'minio-tenant',
        };
        const mockApplicationResponse = {
            id: mockScopeId,
            description: 'Test role',
            name: 'TestRole',
            isDefault: false,
            isSuperRole: false,
            applicationsId: mockApplicationId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        it('should throw UnauthorizedException if route validation fails', async () => {
            jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
                success: false,
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
                message: 'Unauthorized',
            });

            await expect(service.createScope(mockScopeDto, mockApplicationId, mockScopeId, mockHeaders)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw BadRequestException if no data is provided', async () => {
            jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
                success: true,
                message: 'Valid',
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
            });

            await expect(service.createScope(null, mockApplicationId, mockScopeId, mockHeaders)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if no application ID is provided', async () => {
            jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
                success: true,
                message: 'Valid',
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
            });

            await expect(service.createScope(mockScopeDto, null, mockScopeId, mockHeaders)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if application is not found', async () => {
            jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
                success: true,
                message: 'Valid',
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
            });
            jest.spyOn(prismaService.application, 'findUnique').mockResolvedValue(null);
            await expect(service.createScope(mockScopeDto, mockApplicationId, mockScopeId, mockHeaders)).rejects.toThrow(BadRequestException);
        });

        it('should throw UnauthorizedException if tenant IDs do not match', async () => {
            jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
                success: true,
                message: 'Valid',
                data: {
                    id: 'api-key-id',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    keyManager: true,
                    keyValue: 'some-key-value',
                    permissions: 'some-permissions',
                    metaData: 'some-metadata',
                    tenantsId: 'null',
                },
            });
            jest.spyOn(prismaService.application, 'findUnique').mockResolvedValue(mockApplicationRes);

            await expect(service.createScope(mockScopeDto, mockApplicationId, mockScopeId, mockHeaders)).rejects.toThrow(UnauthorizedException);
        });

        it('should create and return new scope', async () => {

            jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
                success: true,
                message: 'Valid',
                data: {
                    id: 'api-key-id',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    keyManager: true,
                    keyValue: 'some-key-value',
                    permissions: 'some-permissions',
                    metaData: 'some-metadata',
                    tenantsId: 'minio-tenant',
                },
            });
            jest.spyOn(prismaService.application, 'findUnique').mockResolvedValue(mockApplicationRes);
            jest.spyOn(prismaService.applicationOauthScope, 'create').mockResolvedValue(mockApplicationResponse);

            const result = await service.createScope(mockScopeDto, mockApplicationId, mockScopeId, mockHeaders);
            expect(result).toEqual({
                success: true,
                message: 'successfully created a new scope',
                data: mockApplicationResponse,
            });
        });

        it('should return data.id when data.id is present', async () => {

            jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
                success: true,
                message: 'Valid',
                data: {
                    id: 'api-key-id',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    keyManager: true,
                    keyValue: 'some-key-value',
                    permissions: 'some-permissions',
                    metaData: 'some-metadata',
                    tenantsId: 'minio-tenant',
                },
            });
            jest.spyOn(prismaService.application, 'findUnique').mockResolvedValue(mockApplicationRes);
            jest.spyOn(prismaService.applicationOauthScope, 'create').mockResolvedValue(mockApplicationResponse);

            const result = await service.createScope(mockScopeDto, mockApplicationId, null, mockHeaders);
            expect(result.data.id).toBe(mockScopeDto.id);
        });

        it('should return scopeId when scopeId is present', async () => {
            jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
                success: true,
                message: 'Valid',
                data: {
                    id: 'api-key-id',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    keyManager: true,
                    keyValue: 'some-key-value',
                    permissions: 'some-permissions',
                    metaData: 'some-metadata',
                    tenantsId: 'minio-tenant',
                },
            });
            jest.spyOn(prismaService.application, 'findUnique').mockResolvedValue(mockApplicationRes);
            jest.spyOn(prismaService.applicationOauthScope, 'create').mockResolvedValue(mockApplicationResponse);
            const result = await service.createScope(mockScopeDtoWithoutID, mockApplicationId, mockScopeId, mockHeaders);
            expect(result.data.id).toBe(mockScopeId);
        });

        it('should return random id when no any id is given', async () => {
            jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
                success: true,
                message: 'Valid',
                data: {
                    id: 'api-key-id',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    keyManager: true,
                    keyValue: 'some-key-value',
                    permissions: 'some-permissions',
                    metaData: 'some-metadata',
                    tenantsId: 'minio-tenant',
                },
            });
            jest.spyOn(prismaService.application, 'findUnique').mockResolvedValue(mockApplicationRes);
            jest.spyOn(prismaService.applicationOauthScope, 'create').mockResolvedValue(mockApplicationResponse);
            const result = await service.createScope(mockScopeDtoWithoutID, mockApplicationId, null, mockHeaders);
            expect(result.data.id).toBe(mockScopeId);
        });
        it('should return random id when no any id is given', async () => {
            jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
                success: true,
                message: 'Valid',
                data: {
                    id: 'api-key-id',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    keyManager: true,
                    keyValue: 'some-key-value',
                    permissions: 'some-permissions',
                    metaData: 'some-metadata',
                    tenantsId: 'minio-tenant',
                },
            });
            jest.spyOn(prismaService.application, 'findUnique').mockResolvedValue(mockApplicationRes);
            jest.spyOn(prismaService.applicationOauthScope, 'create').mockResolvedValue(mockApplicationResponse);
            const result = await service.createScope(mockScopeDtoWithoutID, mockApplicationId, null, mockHeaders);
            expect(result.data.id).toBe(mockScopeId);
        });

        it('should return error creating a new Scope', async () => {
            jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
                success: true,
                message: 'Valid',
                data: {
                    id: 'api-key-id',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    keyManager: true,
                    keyValue: 'some-key-value',
                    permissions: 'some-permissions',
                    metaData: 'some-metadata',
                    tenantsId: 'minio-tenant',
                },
            });
            jest.spyOn(prismaService.application, 'findUnique').mockResolvedValue(mockApplicationRes);
            jest.spyOn(prismaService.applicationOauthScope, 'create').mockResolvedValue(mockApplicationResponse);
            await expect(service.createScope({
                defaultConsentDetail: 'Testscope',
                defaultConsentMessage: 'ScopeConsentMsg',
                name: "name",
                required: true
            }, mockApplicationId, null, mockHeaders)).rejects.toThrow(InternalServerErrorException)
        });

    });



    // update scopes test cases 
    describe('updateScope', () => {
        const mockHeaders = { authorization: 'master', 'x-stencil-tenantid': 'minio-tenant' };
        const mockUpdateScopeDto: UpdateScopeDto = {
            id: 'scope-id',
            defaultConsentDetail: 'Testscope',
            defaultConsentMessage: 'ScopeConsentMsg',
            name: randomUUID(),
            required: true
        };
        const mockScopeDtoWithoutID: ScopeDto = {
            defaultConsentDetail: 'Testscope',
            defaultConsentMessage: 'ScopeConsentMsg',
            name: randomUUID(),
            required: true
        };
        const mockApplicationId = "myminioadmin";
        const mockScopeId = 'scope-id';
        const mockId = 'mock-id'
        const mockApplicationRes = {
            id: mockApplicationId,
            accessTokenSigningKeysId: 'accessTokenSignkeyId',
            active: true,
            data: 'data',
            idTokenSigningKeysId: 'signTokenId',
            createdAt: new Date(),
            updatedAt: new Date(),
            name: 'mockName',
            tenantId: 'minio-tenant',
        };
        const mockApplicationResponse = {
            id: mockScopeId,
            description: 'Test role',
            name: 'TestRole',
            isDefault: false,
            isSuperRole: false,
            applicationsId: mockApplicationId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        it('should throw UnauthorizedException if route validation fails', async () => {
            jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
                success: false,
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
                message: 'Unauthorized',
            });

            await expect(service.updateScope(mockApplicationId, mockScopeId, mockUpdateScopeDto, mockHeaders)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw BadRequestException if no data is provided', async () => {
            jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
                success: true,
                message: 'Valid',
                data: {
                    id: 'api-key-id',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    keyManager: true,
                    keyValue: 'some-key-value',
                    permissions: 'some-permissions',
                    metaData: 'some-metadata',
                    tenantsId: 'minio-tenant',
                },
            });

            await expect(service.updateScope(mockApplicationId, mockScopeId, null, mockHeaders))
                .rejects
                .toThrow(BadRequestException);
        });

        it('should throw BadRequestException if no id is provided', async () => {
            jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
                success: true,
                message: 'Valid',
                data: {
                    id: 'api-key-id',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    keyManager: true,
                    keyValue: 'some-key-value',
                    permissions: 'some-permissions',
                    metaData: 'some-metadata',
                    tenantsId: 'minio-tenant',
                },
            });

            await expect(service.updateScope(null, mockScopeId, mockUpdateScopeDto, mockHeaders))
                .rejects
                .toThrow(BadRequestException);
        });

        it('should throw BadRequestException if no application is found', async () => {
            jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
                success: true,
                message: 'Valid',
                data: {
                    id: 'api-key-id',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    keyManager: true,
                    keyValue: 'some-key-value',
                    permissions: 'some-permissions',
                    metaData: 'some-metadata',
                    tenantsId: 'minio-tenant',
                },
            });
            jest.spyOn(prismaService.application, 'findUnique').mockResolvedValue(null);

            await expect(service.updateScope(mockId, mockScopeId, mockUpdateScopeDto, mockHeaders))
                .rejects
                .toThrow(BadRequestException);
        });
        it('should throw UnauthorizedException if tenant IDs do not match', async () => {
            jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
                success: true,
                message: 'Valid',
                data: {
                    id: 'api-key-id',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    keyManager: true,
                    keyValue: 'some-key-value',
                    permissions: 'some-permissions',
                    metaData: 'some-metadata',
                    tenantsId: 'null',
                },
            });
            jest.spyOn(prismaService.application, 'findUnique').mockResolvedValue(mockApplicationRes);

            await expect(service.updateScope(mockId, mockApplicationId, mockUpdateScopeDto, mockHeaders)).rejects.toThrow(UnauthorizedException);
        });


        it('should udpate the existing scope', async () => {

            jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
                success: true,
                message: 'Valid',
                data: {
                    id: 'api-key-id',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    keyManager: true,
                    keyValue: 'some-key-value',
                    permissions: 'some-permissions',
                    metaData: 'some-metadata',
                    tenantsId: 'minio-tenant',
                },
            });
            jest.spyOn(prismaService.application, 'findUnique').mockResolvedValue(mockApplicationRes);
            jest.spyOn(prismaService.applicationOauthScope, 'create').mockResolvedValue(mockApplicationResponse);

            const result = await service.updateScope("myminioadmin", "scopex", mockUpdateScopeDto, mockHeaders);
            expect(result).toEqual({
                success: true,
                message: 'successfully created a new scope',
                data: mockApplicationResponse,
            });
        });

        // Add more test cases for other conditions as needed.
    });


    // Delete scopes test cases 
    describe('deleteScope', ()=>{

    
    const mockHeaders = { authorization: 'master', 'x-stencil-tenantid': 'minio-tenant' };
    const mockUpdateScopeDto: UpdateScopeDto = {
        id: 'scope-id',
        defaultConsentDetail: 'Testscope',
        defaultConsentMessage: 'ScopeConsentMsg',
        name: randomUUID(),
        required: true
    };
    const mockScopeDtoWithoutID: ScopeDto = {
        defaultConsentDetail: 'Testscope',
        defaultConsentMessage: 'ScopeConsentMsg',
        name: randomUUID(),
        required: true
    };
    const mockApplicationId = "myminioadmin";
    const mockScopeId = 'scope-id';
    const mockId = 'mock-id'
    const mockApplicationRes = {
        id: mockApplicationId,
        accessTokenSigningKeysId: 'accessTokenSignkeyId',
        active: true,
        data: 'data',
        idTokenSigningKeysId: 'signTokenId',
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'mockName',
        tenantId: 'minio-tenant',
    };
    const mockApplicationResponse = {
        id: mockScopeId,
        description: 'Test role',
        name: 'TestRole',
        isDefault: false,
        isSuperRole: false,
        applicationsId: mockApplicationId,
        createdAt: new Date(),
        updatedAt: new Date(),
    }
    it('should throw UnauthorizedException if validation fails', async () => {
        jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
            success: true,
            message: 'Valid',
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
        });

        await expect(service.deleteScope(mockApplicationId, mockScopeId, mockHeaders))
            .rejects
            .toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if no id is provided', async () => {
        jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
            success: true,
            message: 'Valid',
            data: {
                id: 'api-key-id',
                createdAt: new Date(),
                updatedAt: new Date(),
                keyManager: true,
                keyValue: 'some-key-value',
                permissions: 'some-permissions',
                metaData: 'some-metadata',
                tenantsId: 'minio-tenant',
            },
        });

        await expect(service.deleteScope(null, mockScopeId, mockHeaders))
            .rejects
            .toThrow(BadRequestException);
    });

    it('should throw BadRequestException if no application is found', async () => {
        jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
            success: true,
            message: 'Valid',
            data: {
                id: 'api-key-id',
                createdAt: new Date(),
                updatedAt: new Date(),
                keyManager: true,
                keyValue: 'some-key-value',
                permissions: 'some-permissions',
                metaData: 'some-metadata',
                tenantsId: 'minio-tenant',
            },
        });
        jest.spyOn(prismaService.application, 'findUnique').mockResolvedValue(null);

        await expect(service.deleteScope(mockId, mockScopeId, mockHeaders))
            .rejects
            .toThrow(BadRequestException);
    });

    it('should throw BadRequestException if no scopeId is provided', async () => {
        jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
            success: true,
            message: 'Valid',
            data: {
                id: 'api-key-id',
                createdAt: new Date(),
                updatedAt: new Date(),
                keyManager: true,
                keyValue: 'some-key-value',
                permissions: 'some-permissions',
                metaData: 'some-metadata',
                tenantsId: 'minio-tenant',
            },
        });

        await expect(service.deleteScope('id', null, mockHeaders))
            .rejects
            .toThrow(BadRequestException);
    });

    it('should handle error while deleting scope', async () => {
        jest.spyOn(headerAuthService, 'validateRoute').mockResolvedValue({
            success: true,
            message: 'Valid',
            data: {
                id: 'api-key-id',
                createdAt: new Date(),
                updatedAt: new Date(),
                keyManager: true,
                keyValue: 'some-key-value',
                permissions: 'some-permissions',
                metaData: 'some-metadata',
                tenantsId: 'minio-tenant',
            },
        });
        jest.spyOn(prismaService.application, 'findUnique').mockResolvedValue(mockApplicationRes);
        jest.spyOn(prismaService.applicationOauthScope, 'delete').mockImplementation(() => {
            throw new Error('Error');
        });

        await expect(service.deleteScope('id', 'scopeId', {}))
            .rejects
            .toThrow(InternalServerErrorException);
    });

});

    // Similarly, add tests for `updateScope` and `deleteScope` methods
});
