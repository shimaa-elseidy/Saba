import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatCategory',
  standalone: true
})
export class FormatCategoryPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    // أولًا: نحول النص كله لحروف صغيرة ثم نكسره عند `_`
    const words = value.toLowerCase().split('_');

    // ثانيًا: نخلي أول حرف من كل كلمة كابتال
    const formattedWords = words.map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    );

    return formattedWords.join(' ');
  }
}
