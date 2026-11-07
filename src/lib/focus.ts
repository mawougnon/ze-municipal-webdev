export interface FocusedPhoto {
  url: string;
  focusX: number;
  focusY: number;
}

export function focusPosition(focusX: number, focusY: number) {
  return `${focusX}% ${focusY}%`;
}
