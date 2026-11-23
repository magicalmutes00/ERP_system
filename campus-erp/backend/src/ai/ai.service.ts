import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ChatbotService } from './chatbot/chatbot.service';
import { PredictionsService } from './predictions/predictions.service';
import { EvaluatorService } from './evaluator/evaluator.service';
import { SummarizerService } from './summarizer/summarizer.service';
import { RecommendationsService } from './recommendations/recommendations.service';
import { AiTimetableService } from './timetable/timetable.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly chatbotService: ChatbotService,
    private readonly predictionsService: PredictionsService,
    private readonly evaluatorService: EvaluatorService,
    private readonly summarizerService: SummarizerService,
    private readonly recommendationsService: RecommendationsService,
    private readonly aiTimetableService: AiTimetableService,
  ) {}

  async getDashboardInsights(institutionId: string) {
    const [
      attendancePrediction,
      performanceInsights,
      atRiskStudents,
    ] = await Promise.all([
      this.predictionsService.predictOverallAttendance(institutionId),
      this.predictionsService.getPerformanceInsights(institutionId),
      this.predictionsService.getAtRiskStudents(institutionId),
    ]);

    return {
      attendancePrediction,
      performanceInsights,
      atRiskStudents,
    };
  }

  getChatbot() {
    return this.chatbotService;
  }

  getPredictions() {
    return this.predictionsService;
  }

  getEvaluator() {
    return this.evaluatorService;
  }

  getSummarizer() {
    return this.summarizerService;
  }

  getRecommendations() {
    return this.recommendationsService;
  }

  getTimetableAI() {
    return this.aiTimetableService;
  }
}
