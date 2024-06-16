import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateUtilsService {

  constructor() { }

  /**
   * Returns the current formatted date and time.
   */
  getCurrentFormattedDateTime(): { formattedDate: string, formattedTime: string } {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = currentDate.getFullYear();
    let hours = currentDate.getHours();
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedTime = `${hours}:${minutes} ${ampm}`;
    const formattedDate = `${day}/${month}/${year}`;
    return { formattedDate, formattedTime };
  }

  /**
   * Toggles the visibility of the emoji picker.
   * @param showEmojiPicker Current state of emoji picker visibility.
   * @returns Updated state of emoji picker visibility.
   */
  toggleEmojiPicker(showEmojiPicker: boolean): boolean {
    return !showEmojiPicker;
  }

  /**
   * Inserts the selected emoji at the current cursor position within the textarea.
   * @param event Event containing the selected emoji data.
   * @param contentControl Form control for the content textarea.
   */
  insertEmoji(event: any, contentControl: any): void {
    const emoji = event.emoji.native;
    const currentContent: string = contentControl.value || '';
    const cursorPosition: number = currentContent.length;
    const newContent = currentContent.slice(0, cursorPosition) + emoji + currentContent.slice(cursorPosition);
    contentControl.setValue(newContent);
  }
}
