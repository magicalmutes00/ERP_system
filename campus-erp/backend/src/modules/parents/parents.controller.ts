import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ParentsService } from './parents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Parents')
@Controller('parents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all parents' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.parentsService.findAll({
      skip: ((page || 1) - 1) * (limit || 10),
      take: limit || 10,
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my parent profile' })
  async getMyProfile(@CurrentUser() user: any) {
    return this.parentsService.findByUserId(user.sub);
  }

  @Get('me/children')
  @Roles(UserRole.PARENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my children' })
  async getMyChildren(@CurrentUser() user: any) {
    const parent = await this.parentsService.findByUserId(user.sub);
    return this.parentsService.getChildren(parent.id);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get parent by ID' })
  async findById(@Param('id') id: string) {
    return this.parentsService.findById(id);
  }

  @Get(':id/children')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get children of a parent' })
  async getChildren(@Param('id') id: string) {
    return this.parentsService.getChildren(id);
  }

  @Get(':id/children/:studentId/progress')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get child progress report' })
  async getChildProgress(@Param('studentId') studentId: string) {
    return this.parentsService.getChildProgress(studentId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create parent' })
  async create(@Body() data: any) {
    return this.parentsService.create(data);
  }

  @Post('link')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Link parent to student' })
  async linkToStudent(@Body() data: { parentId: string; studentId: string }) {
    return this.parentsService.linkToStudent(data.parentId, data.studentId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update parent' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.parentsService.update(id, data);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete parent' })
  async remove(@Param('id') id: string) {
    return this.parentsService.remove(id);
  }
}
