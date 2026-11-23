import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ChatbotService } from './chatbot/chatbot.service';
import { PredictionsService } from './predictions/predictions.service';
import { EvaluatorService } from './evaluator/evaluator.service';
import { SummarizerService } from './summarizer/summarizer.service';
import { RecommendationsService } from './recommendations/recommendations.service';
import { AiTimetableService } from './timetable/timetable.service';

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    ChatbotService,
    PredictionsService,
    EvaluatorService,
    SummarizerService,
    RecommendationsService,
    AiTimetableService,
  ],
  exports: [AiService],
})
export class AiModule {}
