const { z } = require('zod');

// Common fields
const emailSchema = z.string().email('Invalid email format');
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

// Address schema
const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
});

// Business fields schema
const businessFieldsSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  businessType: z.enum(['retail', 'food', 'entertainment', 'education', 'other']),
  address: addressSchema,
  description: z.string().max(500, 'Description cannot exceed 500 characters'),
});

// Child fields schema
const childFieldsSchema = z.object({
  dateOfBirth: z.string().refine((date) => {
    const dob = new Date(date);
    const now = new Date();
    const age = now.getFullYear() - dob.getFullYear();
    return age >= 6 && age <= 17;
  }, 'Child must be between 6 and 17 years old'),
  parentId: z.string().min(1, 'Parent ID is required'),
});

// Registration schema
exports.registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['business', 'parent', 'child']),
}).and(
  z.union([
    // Business user
    z.object({
      role: z.literal('business'),
    }).merge(businessFieldsSchema),
    // Parent user
    z.object({
      role: z.literal('parent'),
    }),
    // Child user
    z.object({
      role: z.literal('child'),
    }).merge(childFieldsSchema),
  ])
);

// Login schema
exports.loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Reset password schema
exports.resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Forgot password schema
exports.forgotPasswordSchema = z.object({
  email: emailSchema,
});

// 2FA verification schema
exports.twoFactorVerificationSchema = z.object({
  token: z.string().length(6, 'Verification code must be 6 digits').regex(/^\d+$/, 'Verification code must contain only numbers'),
}); 