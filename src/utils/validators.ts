// src/utils/validators.ts
// Input validation schemas and security utilities

import { z } from 'zod';

// Cancellation reasons enum
export const CANCELLATION_REASONS = [
  'too_expensive',
  'not_using',
  'missing_features',
  'technical_issues',
  'competitor',
  'temporary_pause',
  'other'
] as const;

export type CancellationReason = typeof CANCELLATION_REASONS[number];

// Validation schemas using Zod
export const CancellationReasonSchema = z.enum(CANCELLATION_REASONS);

export const UUIDSchema = z.string().uuid('Invalid UUID format');

export const ABVariantSchema = z.enum(['A', 'B']);

// User cancellation request schema
export const CancellationRequestSchema = z.object({
  userId: UUIDSchema,
  subscriptionId: UUIDSchema,
  reason: CancellationReasonSchema,
  reasonOther: z.string().max(500, 'Other reason must be 500 characters or less').optional(),
  downsellVariant: ABVariantSchema,
  acceptedDownsell: z.boolean().default(false),
  sessionId: z.string().min(8).max(32),
  userAgent: z.string().max(500).optional(),
  ipAddress: z.string().ip().optional()
});

// Downsell acceptance schema
export const DownsellAcceptanceSchema = z.object({
  userId: UUIDSchema,
  subscriptionId: UUIDSchema,
  cancellationId: UUIDSchema,
  originalPrice: z.number().int().positive(),
  offeredPrice: z.number().int().min(0)
});

// Step validation schemas for the cancellation flow
export const Step1ValidationSchema = z.object({
  reason: CancellationReasonSchema,
  reasonOther: z.string().max(500).optional().refine(
    (val) => val === undefined || val.trim().length > 0,
    'Other reason cannot be empty when provided'
  )
});

export const Step2ValidationSchema = z.object({
  acceptDownsell: z.boolean()
});

export const Step3ValidationSchema = z.object({
  confirmCancellation: z.boolean().refine((val) => val === true, 'Must confirm cancellation')
});

// Database record schemas
export const UserSchema = z.object({
  id: UUIDSchema,
  email: z.string().email(),
  created_at: z.string().datetime()
});

export const SubscriptionSchema = z.object({
  id: UUIDSchema,
  user_id: UUIDSchema,
  monthly_price: z.number().int().positive(),
  status: z.enum(['active', 'pending_cancellation', 'cancelled']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const CancellationSchema = z.object({
  id: UUIDSchema,
  user_id: UUIDSchema,
  subscription_id: UUIDSchema,
  downsell_variant: ABVariantSchema,
  reason: CancellationReasonSchema.nullable(),
  reason_other: z.string().max(500).nullable(),
  accepted_downsell: z.boolean(),
  downsell_original_price: z.number().int().positive().nullable(),
  downsell_offered_price: z.number().int().min(0).nullable(),
  session_id: z.string().nullable(),
  user_agent: z.string().max(500).nullable(),
  ip_address: z.string().nullable(),
  completed_at: z.string().datetime().nullable(),
  created_at: z.string().datetime()
});

// Type exports
export type CancellationRequest = z.infer<typeof CancellationRequestSchema>;
export type DownsellAcceptance = z.infer<typeof DownsellAcceptanceSchema>;
export type Step1Validation = z.infer<typeof Step1ValidationSchema>;
export type Step2Validation = z.infer<typeof Step2ValidationSchema>;
export type Step3Validation = z.infer<typeof Step3ValidationSchema>;
export type User = z.infer<typeof UserSchema>;
export type Subscription = z.infer<typeof SubscriptionSchema>;
export type Cancellation = z.infer<typeof CancellationSchema>;

// Security utilities
export function sanitizeString(input: string | undefined | null, maxLength = 1000): string {
  if (!input) return '';
  
  // Remove potential XSS characters and trim
  const sanitized = input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>&"']/g, '') // Remove dangerous characters
    .trim()
    .substring(0, maxLength);
    
  return sanitized;
}

export function validateAndSanitizeReason(
  reason: string, 
  reasonOther?: string
): { reason: CancellationReason; reasonOther?: string } {
  // Validate main reason
  const validatedReason = CancellationReasonSchema.parse(reason);
  
  // Validate and sanitize "other" text if provided
  let sanitizedOther: string | undefined;
  if (validatedReason === 'other' && reasonOther) {
    sanitizedOther = sanitizeString(reasonOther, 500);
    if (!sanitizedOther.trim()) {
      throw new Error('Other reason cannot be empty when "other" is selected');
    }
  }
  
  return {
    reason: validatedReason,
    reasonOther: sanitizedOther
  };
}

// IP address validation and sanitization
export function validateIpAddress(ip: string | undefined): string | null {
  if (!ip) return null;
  
  try {
    // Basic IP validation (both IPv4 and IPv6)
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    if (ipRegex.test(ip)) {
      return ip;
    }
    return null;
  } catch {
    return null;
  }
}

// User Agent validation and sanitization
export function validateUserAgent(userAgent: string | undefined): string | null {
  if (!userAgent) return null;
  
  // Sanitize and limit length
  const sanitized = sanitizeString(userAgent, 500);
  return sanitized || null;
}

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export function createValidationError(field: string, message: string, code = 'INVALID_INPUT'): ValidationError {
  return { field, message, code };
}

// Helper to validate required UUID
export function validateRequiredUUID(value: unknown, fieldName: string): string {
  if (!value || typeof value !== 'string') {
    throw createValidationError(fieldName, `${fieldName} is required`, 'REQUIRED');
  }
  
  try {
    return UUIDSchema.parse(value);
  } catch {
    throw createValidationError(fieldName, `${fieldName} must be a valid UUID`, 'INVALID_FORMAT');
  }
}

// Reason display helpers
export function getReasonDisplayText(reason: CancellationReason): string {
  const reasonMap: Record<CancellationReason, string> = {
    too_expensive: 'Too expensive',
    not_using: 'Not using the service',
    missing_features: 'Missing features I need',
    technical_issues: 'Technical issues',
    competitor: 'Found a better alternative',
    temporary_pause: 'Need a temporary pause',
    other: 'Other'
  };
  
  return reasonMap[reason] || reason;
}

// Export all validation schemas
export {
  CancellationReasonSchema,
  UUIDSchema,
  ABVariantSchema,
  CancellationRequestSchema,
  DownsellAcceptanceSchema,
  Step1ValidationSchema,
  Step2ValidationSchema,
  Step3ValidationSchema,
  UserSchema,
  SubscriptionSchema,
  CancellationSchema
};