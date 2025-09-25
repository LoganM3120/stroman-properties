import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export function renderEmail(element: ReactElement): string {
  const markup = renderToStaticMarkup(element);
  return `<!DOCTYPE html>${markup}`;
}
