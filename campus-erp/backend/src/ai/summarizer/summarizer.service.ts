import { Injectable } from '@nestjs/common';

@Injectable()
export class SummarizerService {
  async summarize(content: string, maxLength: number = 200): Promise<{
    summary: string;
    keyPoints: string[];
    wordCount: number;
  }> {
    const sentences = this.splitSentences(content);
    const wordCount = content.split(/\s+/).length;

    const sentenceScores = sentences.map((sentence, i) => ({
      sentence,
      index: i,
      score: this.scoreSentence(sentence, sentences, i),
    }));

    sentenceScores.sort((a, b) => b.score - a.score);

    const numSentences = Math.max(3, Math.ceil(maxLength / 20));
    const topSentences = sentenceScores
      .slice(0, Math.min(numSentences, sentences.length))
      .sort((a, b) => a.index - b.index)
      .map(s => s.sentence);

    const summary = topSentences.join(' ');
    const keyPoints = this.extractKeyPoints(content, 5);

    return {
      summary: summary.length > maxLength * 5 ? summary.substring(0, maxLength * 5) + '...' : summary,
      keyPoints,
      wordCount,
    };
  }

  private splitSentences(text: string): string[] {
    const sentences = text.match(/[^.!?\n]+[.!?]*/g) || [];
    return sentences.map(s => s.trim()).filter(s => s.length > 10);
  }

  private scoreSentence(sentence: string, allSentences: string[], index: number): number {
    const words = sentence.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const wordFrequencies: Record<string, number> = {};

    allSentences.forEach(s => {
      s.toLowerCase().split(/\s+/).filter(w => w.length > 2).forEach(w => {
        wordFrequencies[w] = (wordFrequencies[w] || 0) + 1;
      });
    });

    const totalSentences = allSentences.length;
    let score = words.reduce((sum, word) => {
      const freq = wordFrequencies[word] || 0;
      return sum + (freq / totalSentences);
    }, 0) / Math.max(words.length, 1);

    if (index === 0 || index === allSentences.length - 1) score *= 1.2;

    const titleWords = ['important', 'significant', 'key', 'main', 'primary', 'critical', 'essential', 'overview',
      'introduction', 'conclusion', 'summary', 'result', 'finding', 'therefore', 'thus', 'consequently'];
    const hasTitleWords = titleWords.some(w => sentence.toLowerCase().includes(w));
    if (hasTitleWords) score *= 1.3;

    return score;
  }

  private extractKeyPoints(text: string, count: number): string[] {
    const sentences = this.splitSentences(text);
    const scored = sentences.map((s, i) => ({
      sentence: s,
      score: this.scoreSentence(s, sentences, i),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, count).map(s => s.sentence.length > 100 ? s.sentence.substring(0, 97) + '...' : s.sentence);
  }
}
