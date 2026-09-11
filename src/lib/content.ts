import type { ContentItem } from '../data';

export const categories = ['All notes', 'Foundations', 'Inference', 'RAG & Agents', 'Cloud & Tools'];

export function categoryFor(item: ContentItem): string {
  if (item.url) return 'Cloud & Tools';
  if (item.topics.some(topic => ['RAG', 'Agents', 'Embeddings'].includes(topic))) return 'RAG & Agents';
  if (item.topics.some(topic => ['Inference', 'Performance', 'Infrastructure'].includes(topic))) return 'Inference';
  return 'Foundations';
}

export function toneFor(item: ContentItem): string {
  return ({ 'Foundations': 'orange', 'Inference': 'violet', 'RAG & Agents': 'green', 'Cloud & Tools': 'blue' })[categoryFor(item)] || 'orange';
}
