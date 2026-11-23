import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('insights')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get AI-powered dashboard insights' })
  async getInsights(@CurrentUser() user: any) {
    return this.aiService.getDashboardInsights(user.institutionId);
  }

  @Post('chat')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chat with AI assistant' })
  async chat(@Body() body: { message: string; context?: string }): Promise<any> {
    return this.aiService.getChatbot().handleMessage(body.message, body.context);
  }

  @Post('attendance/predict')
  @Roles(UserRole.ADMIN, UserRole.FACULTY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Predict attendance trends' })
  async predictAttendance(@Body() body: { courseId: string }): Promise<any> {
    return this.aiService.getPredictions().predictAttendance(body.courseId);
  }

  @Post('evaluate')
  @Roles(UserRole.FACULTY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI evaluate assignment/exam answer' })
  async evaluate(@Body() body: { question: string; answer: string; maxMarks: number }) {
    return this.aiService.getEvaluator().evaluate(body.question, body.answer, body.maxMarks);
  }

  @Post('summarize')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Summarize notes or content' })
  async summarize(@Body() body: { content: string; maxLength?: number }) {
    return this.aiService.getSummarizer().summarize(body.content, body.maxLength);
  }

  @Post('recommend/courses')
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get course recommendations' })
  async recommendCourses(@CurrentUser() user: any) {
    return this.aiService.getRecommendations().recommendCourses(user.sub);
  }

  @Post('timetable/generate')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI generate optimal timetable' })
  async generateTimetable(@Body() body: { departmentId: string; semester: number }) {
    return this.aiService.getTimetableAI().generate(body.departmentId, body.semester);
  }

  @Get('students/at-risk')
  @Roles(UserRole.ADMIN, UserRole.FACULTY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get at-risk students based on AI analysis' })
  async getAtRiskStudents(@Query('courseId') courseId?: string) {
    return this.aiService.getPredictions().getAtRiskStudents(undefined, courseId);
  }
}
