import { PointerSensor } from '@dnd-kit/core';

/**
 * Custom PointerSensor that ignores interactive elements.
 * Prevents drag from starting when clicking on buttons, inputs, selects, etc.
 */
export class SmartPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: 'onPointerDown' as const,
      handler: ({ nativeEvent: event }: React.PointerEvent) => {
        const interactiveTags = ['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'A', 'LABEL'];
        let element = event.target as HTMLElement | null;

        while (element) {
          if (interactiveTags.includes(element.tagName) || element.dataset.noDnd === 'true') {
            return false;
          }
          element = element.parentElement;
        }

        return true;
      },
    },
  ];
}
