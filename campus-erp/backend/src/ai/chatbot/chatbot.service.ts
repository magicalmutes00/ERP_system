import { Injectable, Logger } from '@nestjs/common';

interface ChatContext {
  role: string;
  userId: string;
  previousMessages?: Array<{ role: string; content: string }>;
}

interface ChatResponse {
  reply: string;
  suggestions?: string[];
  actions?: Array<{ label: string; endpoint: string; method: string }>;
}

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  private readonly intents: Record<string, { pattern: RegExp; response: (match: RegExpMatchArray) => string }> = {
    attendance: {
      pattern: /(attendance|present|absent|leave|mark).*/i,
      response: () => 'You can check your attendance in the Attendance section. I can help you view attendance reports or mark attendance if you are faculty.',
    },
    exam: {
      pattern: /(exam|test|result|grade|marks).*/i,
      response: () => 'For exam-related queries, you can view your exam schedule, results, and hall tickets in the Exams section.',
    },
    fee: {
      pattern: /(fee|payment|due|pay|invoice).*/i,
      response: () => 'Fee details are available in the Fees section. You can view your fee structure, payment history, and make payments online.',
    },
    course: {
      pattern: /(course|subject|syllabus|module|lesson).*/i,
      response: () => 'Course materials including syllabus, modules, and assignments are available in the Courses section.',
    },
    timetable: {
      pattern: /(timetable|schedule|class|period|time).*/i,
      response: () => 'Your class schedule/timetable is available in the Timetable section. It shows your daily and weekly schedules.',
    },
    profile: {
      pattern: /(profile|account|password|update|change).*/i,
      response: () => 'You can manage your profile, change password, and update personal details in the Profile/Settings section.',
    },
    help: {
      pattern: /(help|support|contact|guide|tutorial).*/i,
      response: () => 'I can help you with:\n1. Attendance tracking\n2. Exam schedules & results\n3. Fee payments\n4. Course materials\n5. Timetable\n6. Profile management\n7. Assignments & submissions\n\nWhat would you like help with?',
    },
    greeting: {
      pattern: /(hello|hi|hey|greetings|good\s*(morning|afternoon|evening)).*/i,
      response: (match) => {
        const timeGreeting = match[2] ? `Good ${match[2]}!` : 'Hello!';
        return `${timeGreeting} I'm your Campus AI assistant. I can help you with attendance, exams, fees, courses, timetable, and more. How can I assist you today?`;
      },
    },
  };

  async handleMessage(message: string, context?: string): Promise<ChatResponse> {
    const normalizedMessage = message.toLowerCase().trim();

    for (const [intent, handler] of Object.entries(this.intents)) {
      const match = normalizedMessage.match(handler.pattern);
      if (match) {
        const reply = handler.response(match);
        return {
          reply,
          suggestions: this.getSuggestions(intent),
          actions: this.getActions(intent),
        };
      }
    }

    return {
      reply: 'I\'m not sure how to help with that. I can assist with attendance, exams, fees, courses, timetable, and profile management. Type "help" to see what I can do.',
      suggestions: ['Check attendance', 'View timetable', 'Fee status', 'Exam schedule', 'Help'],
    };
  }

  private getSuggestions(intent: string): string[] {
    const suggestions: Record<string, string[]> = {
      attendance: ['View attendance report', 'Apply for leave', 'Attendance analytics'],
      exam: ['View exam schedule', 'Check results', 'Download hall ticket'],
      fee: ['Pay fees online', 'View fee structure', 'Download receipt'],
      course: ['View course materials', 'My enrolled courses', 'Course progress'],
      timetable: ['Today\'s schedule', 'Weekly timetable', 'Faculty schedule'],
      profile: ['Update profile', 'Change password'],
      help: ['Check attendance', 'View timetable', 'Fee status', 'Exam schedule', 'Course progress'],
      greeting: ['Check attendance', 'View timetable', 'Exam schedule'],
    };
    return suggestions[intent] || ['Help', 'Check attendance', 'View timetable'];
  }

  private getActions(intent: string): Array<{ label: string; endpoint: string; method: string }> {
    const actions: Record<string, Array<{ label: string; endpoint: string; method: string }>> = {
      attendance: [
        { label: 'View Attendance', endpoint: '/api/v1/attendance/my', method: 'GET' },
        { label: 'Apply Leave', endpoint: '/api/v1/attendance/leave', method: 'POST' },
      ],
      exam: [
        { label: 'Exam Schedule', endpoint: '/api/v1/exams', method: 'GET' },
        { label: 'My Results', endpoint: '/api/v1/exams/student/results', method: 'GET' },
      ],
      fee: [
        { label: 'Pay Now', endpoint: '/api/v1/fees/my', method: 'GET' },
        { label: 'Payment History', endpoint: '/api/v1/fees/payments', method: 'GET' },
      ],
    };
    return actions[intent] || [];
  }
}
