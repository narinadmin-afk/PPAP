import { ActionPriority } from '../types/ppap';

/**
 * AIAG & VDA FMEA 1st Edition Action Priority (AP) logic
 * Evaluates risk ranking into High, Medium, or Low priority
 */
export function calculateActionPriority(s: number, o: number, d: number): ActionPriority {
  // Severity 9-10 (Safety / Regulatory)
  if (s >= 9) {
    if (o >= 4) return 'High';
    if (d >= 7) return 'High';
    return 'Medium';
  }
  // Severity 7-8 (Primary function loss)
  if (s >= 7) {
    if (o >= 6) return 'High';
    if (o >= 4 && d >= 5) return 'High';
    if (o >= 2) return 'Medium';
    return 'Low';
  }
  // Severity 4-6 (Secondary function loss / Annoyance)
  if (s >= 4) {
    if (o >= 8 && d >= 5) return 'High';
    if (o >= 4) return 'Medium';
    return 'Low';
  }
  // Severity 1-3 (Minor / No noticeable effect)
  return 'Low';
}
