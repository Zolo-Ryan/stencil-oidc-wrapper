import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ResponseDto } from '../../dto/response.dto';
import {
  CreateUserAndUserRegistration,
  CreateUserRegistrationDto,
  UpdateUserRegistrationDto,
  UserData,
} from '../user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { randomUUID } from 'crypto';
import { HeaderAuthService } from '../../header-auth/header-auth.service';
import { UserService } from '../user.service';
import { UtilsService } from '../../utils/utils.service';

@Injectable()
export class UserRegistrationService {
  private readonly logger: Logger;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly headerAuthService: HeaderAuthService,
    private readonly userService: UserService,
    private readonly utilService: UtilsService,
  ) {
    this.logger = new Logger(UserRegistrationService.name);
  }

  async createAUserRegistration(
    userId: string,
    data: CreateUserRegistrationDto,
    headers: object,
  ): Promise<ResponseDto> {
    if (!data || !data.applicationId || !userId) {
      throw new BadRequestException({
        success: false,
        message: 'No data given for registration',
      });
    }
    const application = await this.prismaService.application.findUnique({
      where: { id: data.applicationId },
    });
    if (!application) {
      throw new BadRequestException({
        success: false,
        message: 'No application with given id exists',
      });
    }
    const tenantId = application.tenantId;
    const valid = await this.headerAuthService.authorizationHeaderVerifier(
      headers,
      tenantId,
      '/user/registration',
      'POST',
    );
    if (!valid.success) {
      throw new UnauthorizedException({
        success: false,
        message: valid.message,
      });
    }
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException({
        success: false,
        message: 'No such user exists',
      });
    }
    const registrationId = data.registrationId
      ? data.registrationId
      : randomUUID();
    const userData: UserData = await JSON.parse(user.data);
    const password: string | null = userData?.userData?.password;
    // const verified = false; //for now
    // const verifiedInstant = 0;
    try {
      const userRegistration = await this.prismaService.userRegistration.create(
        {
          data: {
            id: registrationId,
            usersId: userId,
            applicationsId: application.id,
            password,
          },
        },
      );
      this.logger.log('A new user registration is made!', userRegistration);
      return {
        success: true,
        message: 'A user registered',
        data: { userRegistration },
      };
    } catch (error) {
      this.logger.log('Error from createAUserRegistration', error);
      throw new InternalServerErrorException({
        success: false,
        message: 'Error occured while creatin user registration',
      });
    }
  }

  async returnAUserRegistration(
    userId: string,
    applicationId: string,
    headers: object,
  ): Promise<ResponseDto> {
    const application = await this.prismaService.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) {
      throw new BadRequestException({
        success: false,
        message: 'No application with given id exists',
      });
    }
    const tenantId = application.tenantId;
    const valid = await this.headerAuthService.authorizationHeaderVerifier(
      headers,
      tenantId,
      '/user/registration',
      'GET',
    );
    if (!valid.success) {
      throw new UnauthorizedException({
        success: false,
        message: valid.message,
      });
    }
    if (!userId) {
      throw new BadRequestException({
        success: false,
        message: 'No user id given',
      });
    }
    let userRegistration;
    try {
      userRegistration = await this.prismaService.userRegistration.findUnique({
        where: { user_registrations_uk_1: {usersId: userId,applicationsId: applicationId} },
      });
    } catch (error) {
      this.logger.log('Error from returnAUserRegistration', error);
      throw new InternalServerErrorException({
        success: false,
        message: 'Internal server error while returning the user Registration',
      });
    }
    if (!userRegistration) {
      throw new BadRequestException({
        success: false,
        message:
          'No user registration exists for the given user id on the application',
      });
    }
    return {
      success: true,
      message: 'User registration found successfully',
      data: userRegistration,
    };
  }

  async updateAUserRegistration(
    userId: string,
    applicationId: string,
    data: UpdateUserRegistrationDto,
    headers: object,
  ): Promise<ResponseDto> {
    if (!data || !applicationId || !userId) {
      throw new BadRequestException({
        success: false,
        message: 'No data given for registration',
      });
    }
    const application = await this.prismaService.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) {
      throw new BadRequestException({
        success: false,
        message: 'No application with given id exists',
      });
    }
    const tenantId = application.tenantId;
    const valid = await this.headerAuthService.authorizationHeaderVerifier(
      headers,
      tenantId,
      '/user/registration',
      'PATCH',
    );
    if (!valid.success) {
      throw new UnauthorizedException({
        success: false,
        message: valid.message,
      });
    }
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException({
        success: false,
        message: 'No such user exists',
      });
    }
    const oldUserRegistration =
      await this.prismaService.userRegistration.findFirst({
        where: { usersId: userId, applicationsId: applicationId },
      });
    const additionalData = data.data
      ? JSON.stringify(data.data)
      : oldUserRegistration.data;
    try {
      const userRegistration = await this.prismaService.userRegistration.update(
        {
          where: { id: oldUserRegistration.id },
          data: {
            data: additionalData,
          },
        },
      );
      this.logger.log('User registration updated', userRegistration);
      return {
        success: true,
        message: 'User registration updated',
        data: userRegistration,
      };
    } catch (error) {
      this.logger.log('Error from updateAUserRegistration', error);
      throw new InternalServerErrorException({
        success: false,
        message: 'Error while updating user Registration',
      });
    }
  }

  async deleteAUserRegistration(
    usersId: string,
    applicationsId: string,
    headers: object,
  ): Promise<ResponseDto> {
    const application = await this.prismaService.application.findUnique({
      where: { id: applicationsId },
    });
    if (!application) {
      throw new BadRequestException({
        success: false,
        message: 'No application with given id exists',
      });
    }
    const tenantId = application.tenantId;
    const valid = await this.headerAuthService.authorizationHeaderVerifier(
      headers,
      tenantId,
      '/user/registration',
      'DELETE',
    );
    if (!valid.success) {
      throw new UnauthorizedException({
        success: false,
        message: valid.message,
      });
    }
    if (!usersId) {
      throw new BadRequestException({
        success: false,
        message: 'No user id given',
      });
    }
    const oldUserRegistration =
      await this.prismaService.userRegistration.findFirst({
        where: { usersId, applicationsId },
      });
    if (!oldUserRegistration) {
      throw new BadRequestException({
        success: false,
        message: 'No such user registration exists',
      });
    }
    try {
      const userRegistration = await this.prismaService.userRegistration.delete(
        { where: { id: oldUserRegistration.id } },
      );
      this.logger.log('A user registration is deleted', userRegistration);
      return {
        success: true,
        message: 'User registration deleted successfully',
        data: userRegistration,
      };
    } catch (error) {
      this.logger.log('Error from deleteAUserRegistration', error);
      throw new InternalServerErrorException({
        success: false,
        message: 'Internal server error while deleting a user registration',
      });
    }
  }

  async createAUserAndUserRegistration(
    userId: string,
    data: CreateUserAndUserRegistration,
    headers: object,
  ): Promise<ResponseDto> {
    const valid = await this.headerAuthService.validateRoute(
      headers,
      '/user/registration',
      'POST',
    );
    if (!valid.success) {
      throw new UnauthorizedException({
        success: valid.success,
        message: valid.message,
      });
    }
    const tenantId = valid.data.tenantsId
      ? valid.data.tenantsId
      : headers['x-stencil-tenantid'];
    const application = await this.prismaService.application.findUnique({
      where: { id: data.registrationInfo.applicationId },
    });
    if (application.tenantId !== tenantId && valid.data.tenantsId !== null) {
      throw new UnauthorizedException({
        success: false,
        message: 'You are not authorized enough',
      });
    }
    if (!data || !data.userInfo || !data.registrationInfo) {
      throw new BadRequestException({
        success: false,
        message: 'Either data, data.userInfo or data.registrationInfo missing',
      });
    }
    const { userInfo, registrationInfo } = data;
    if (
      !userInfo.active ||
      !userInfo.membership ||
      !userInfo.userData ||
      !userInfo.email
    ) {
      throw new BadRequestException({
        success: false,
        message: 'Data missing active, membership array, email or userData',
      });
    }
    try {
      const user = await this.userService.createAUser(
        userId,
        userInfo,
        headers,
      );
      try {
        const userRegistration = await this.createAUserRegistration(
          userId,
          registrationInfo,
          headers,
        );
        return {
          success: true,
          message: 'User and user registration created successfully!',
          data: {
            user,
            userRegistration,
          },
        };
      } catch (error) {
        this.logger.log(
          'Error occured while creating User registration',
          error,
        );
        throw new InternalServerErrorException({
          success: false,
          message: 'Error occured while creating user Registration',
        });
      }
    } catch (error) {
      this.logger.log('Error occured while creating a user', error);
      throw new InternalServerErrorException({
        success: false,
        message: 'Error occured while creating a user',
      });
    }
  }
}
