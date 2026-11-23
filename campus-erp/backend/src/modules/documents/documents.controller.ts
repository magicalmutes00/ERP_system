import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all documents' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('studentId') studentId?: string,
  ) {
    const where: any = {};
    if (studentId) where.studentId = studentId;
    return this.documentsService.findAll({ skip: ((page || 1) - 1) * (limit || 10), take: limit || 10, where });
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get document by ID' })
  async findById(@Param('id') id: string) {
    return this.documentsService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload document' })
  async create(@Body() data: any) {
    return this.documentsService.create(data);
  }

  @Patch(':id/verify')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify document' })
  async verify(@Param('id') id: string, @Body('verifiedBy') verifiedBy: string) {
    return this.documentsService.verify(id, verifiedBy);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete document' })
  async remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
