# Phone Number Validation System

## Overview
The newsletter subscription system now includes intelligent phone number validation that automatically handles Nigerian phone numbers and international formats.

## Supported Formats

### Nigerian Numbers
The system automatically detects and formats Nigerian phone numbers:

1. **Local format with leading 0**: `08161781643`
   - Automatically converts to: `+2348161781643`

2. **Local format without leading 0**: `8161781643`
   - Automatically converts to: `+2348161781643`

3. **With country code**: `2348161781643`
   - Automatically converts to: `+2348161781643`

4. **International format**: `+2348161781643`
   - Accepted as-is

### International Numbers
- **US/Canada**: `+1234567890`
- **UK**: `+44123456789`
- **Other countries**: Any valid international format with country code

## Validation Rules

### Nigerian Numbers
- Must be 10 or 11 digits (excluding country code)
- Must start with valid Nigerian mobile prefixes:
  - **MTN**: 703, 704, 706, 803, 806, 810, 813, 814, 816, 903, 906
  - **Airtel**: 701, 708, 802, 808, 812, 901, 902, 907, 911
  - **Glo**: 705, 805, 807, 811, 815, 905, 915
  - **9mobile**: 809, 817, 818, 908, 909
  - And other valid prefixes

### International Numbers
- Must include country code (+ prefix)
- Length between 10-16 digits total
- Follows international numbering standards

## Examples

### ✅ Valid Inputs
```
08161781643          → +2348161781643
8161781643           → +2348161781643
2348161781643        → +2348161781643
+2348161781643       → +2348161781643
+1234567890          → +1234567890
+44123456789         → +44123456789
```

### ❌ Invalid Inputs
```
081617816            → Too short
081617816432         → Too long for Nigerian
123456               → Too short
abcd1234567          → Contains letters
```

## Error Messages
The system provides specific error messages:
- "Please enter a valid Nigerian phone number (11 digits starting with 0)"
- "Please enter a valid Nigerian mobile number"
- "Please enter a valid international phone number"
- "Please enter a valid phone number (Nigerian: 08161781643 or International: +1234567890)"

## Implementation
The validation is handled by the `validateAndFormatPhone()` function in `/lib/phone-utils.ts` and is used in:
- Newsletter subscription API (`/api/newsletter/subscribe`)
- Dashboard subscriber management
- All phone number input fields

## User Experience
- Users can enter Nigerian numbers in any common format
- The system automatically adds the +234 country code
- Clear placeholder text guides users: "Phone number (e.g., 08161781643 or +2348161781643)"
- Helpful error messages guide users to correct format