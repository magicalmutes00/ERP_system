import { Injectable } from '@nestjs/common';

@Injectable()
export class EvaluatorService {
  async evaluate(
    question: string,
    answer: string,
    maxMarks: number,
  ): Promise<{
    marks: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  }> {
    const metrics = this.analyzeAnswer(question, answer);
    const marks = Math.min(
      Math.round((metrics.relevance * 0.4 + metrics.completeness * 0.3 + metrics.clarity * 0.2 + metrics.examples * 0.1) * maxMarks * 100) / 100,
      maxMarks,
    );

    const strengths: string[] = [];
    const improvements: string[] = [];

    if (metrics.relevance > 0.7) strengths.push('Good relevance to the question');
    else improvements.push('Focus more on directly answering the question');

    if (metrics.completeness > 0.7) strengths.push('Comprehensive coverage of topics');
    else improvements.push('Cover more aspects of the topic');

    if (metrics.examples > 0.5) strengths.push('Good use of examples');
    else improvements.push('Include relevant examples to support your answer');

    return {
      marks: Math.max(0, marks),
      feedback: this.generateFeedback(marks, maxMarks, metrics),
      strengths,
      improvements,
    };
  }

  private analyzeAnswer(question: string, answer: string): {
    relevance: number;
    completeness: number;
    clarity: number;
    examples: number;
  } {
    const questionWords = question.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const answerWords = answer.toLowerCase().split(/\s+/);
    const answerLower = answer.toLowerCase();

    const keyTerms = questionWords.filter(w =>
      ['explain', 'describe', 'define', 'compare', 'contrast', 'analyze',
       'discuss', 'outline', 'summarize', 'what', 'why', 'how'].includes(w)
    );

    const relevantTerms = questionWords.filter(w => answerLower.includes(w));
    const relevance = questionWords.length > 0 ? relevantTerms.length / questionWords.length : 0.5;

    const wordCount = answerWords.length;
    const completeness = Math.min(wordCount / 100, 1) * 0.8 + (relevantTerms.length / Math.max(questionWords.length, 1)) * 0.2;

    const sentenceEndings = (answer.match(/[.!?]/g) || []).length;
    const avgSentenceLength = sentenceEndings > 0 ? wordCount / sentenceEndings : wordCount;
    const clarity = Math.max(0, 1 - Math.abs(avgSentenceLength - 20) / 40);

    const exampleIndicators = ['for example', 'for instance', 'such as', 'e.g.', 'i.e.', 'like', 'specifically', 'particularly', 'including'];
    const exampleCount = exampleIndicators.filter(e => answerLower.includes(e)).length;
    const examples = Math.min(exampleCount / 2, 1);

    return { relevance, completeness, clarity, examples };
  }

  private generateFeedback(marks: number, maxMarks: number, metrics: any): string {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 80) return 'Excellent answer! Well-structured, relevant, and comprehensive.';
    if (percentage >= 60) return 'Good answer covering most key points. Consider adding more depth and examples.';
    if (percentage >= 40) return 'Satisfactory but needs improvement in structure and completeness.';
    return 'Needs significant improvement. Focus on answering the question directly and covering key concepts.';
  }
}
