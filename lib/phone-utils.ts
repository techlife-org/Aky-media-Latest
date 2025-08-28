/**
 * Phone number utilities for handling Nigerian and international phone numbers
 */

export interface PhoneValidationResult {
  isValid: boolean;
  formattedPhone?: string;
  error?: string;
}

/**
 * Validates and formats phone numbers, with special handling for Nigerian numbers
 * @param phone - The phone number to validate and format
 * @returns PhoneValidationResult with validation status and formatted number
 */
export function validateAndFormatPhone(phone: string): PhoneValidationResult {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  if (!cleanPhone) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }

  // Handle different phone number formats
  
  // Case 1: Already has country code (starts with +)
  if (cleanPhone.startsWith('+')) {
    if (cleanPhone.length >= 10 && cleanPhone.length <= 16) {
      return { isValid: true, formattedPhone: cleanPhone };
    }
    return { isValid: false, error: 'Please enter a valid international phone number' };
  }
  
  // Case 2: Nigerian number starting with country code (234)
  if (cleanPhone.startsWith('234')) {
    if (cleanPhone.length === 13) { // 234 + 10 digits
      return { isValid: true, formattedPhone: `+${cleanPhone}` };
    }
    return { isValid: false, error: 'Please enter a valid Nigerian phone number' };
  }
  
  // Case 3: Nigerian number starting with 0 (local format)
  if (cleanPhone.startsWith('0')) {
    if (cleanPhone.length === 11) { // 0 + 10 digits
      // Remove leading 0 and add +234
      const withoutZero = cleanPhone.substring(1);
      return { isValid: true, formattedPhone: `+234${withoutZero}` };
    }
    return { isValid: false, error: 'Please enter a valid Nigerian phone number (11 digits starting with 0)' };
  }
  
  // Case 4: Nigerian number without leading 0 or country code
  if (cleanPhone.length === 10) {
    // Check if it starts with valid Nigerian mobile prefixes
    const validPrefixes = ['701', '702', '703', '704', '705', '706', '707', '708', '709', 
                          '801', '802', '803', '804', '805', '806', '807', '808', '809', 
                          '810', '811', '812', '813', '814', '815', '816', '817', '818', '819',
                          '901', '902', '903', '904', '905', '906', '907', '908', '909',
                          '915', '916', '917', '918'];
    
    const prefix = cleanPhone.substring(0, 3);
    if (validPrefixes.includes(prefix)) {
      return { isValid: true, formattedPhone: `+234${cleanPhone}` };
    }
    return { isValid: false, error: 'Please enter a valid Nigerian mobile number' };
  }
  
  // Case 5: Other international numbers (without +)
  if (cleanPhone.length >= 10 && cleanPhone.length <= 15) {
    // For other countries, we'll accept them as-is with + prefix
    return { isValid: true, formattedPhone: `+${cleanPhone}` };
  }
  
  return { 
    isValid: false, 
    error: 'Please enter a valid phone number (Nigerian: 08161781643 or International: +1234567890)' 
  };
}

/**
 * Formats a phone number for display
 * @param phone - The phone number to format
 * @returns Formatted phone number string
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return '';
  
  // If it's a Nigerian number, format it nicely
  if (phone.startsWith('+234')) {
    const number = phone.substring(4); // Remove +234
    if (number.length === 10) {
      return `+234 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    }
  }
  
  // For other international numbers, just return as-is
  return phone;
}

/**
 * Checks if a phone number is Nigerian
 * @param phone - The phone number to check
 * @returns boolean indicating if it's a Nigerian number
 */
export function isNigerianNumber(phone: string): boolean {
  if (!phone) return false;
  return phone.startsWith('+234');
}

/**
 * Gets the country code from a phone number
 * @param phone - The phone number
 * @returns The country code or null if not found
 */
export function getCountryCode(phone: string): string | null {
  if (!phone || !phone.startsWith('+')) return null;
  
  // Common country codes
  const countryCodes = [
    { code: '+234', country: 'Nigeria' },
    { code: '+1', country: 'US/Canada' },
    { code: '+44', country: 'UK' },
    { code: '+33', country: 'France' },
    { code: '+49', country: 'Germany' },
    { code: '+91', country: 'India' },
    { code: '+86', country: 'China' },
    { code: '+81', country: 'Japan' },
    { code: '+82', country: 'South Korea' },
    { code: '+61', country: 'Australia' },
    { code: '+27', country: 'South Africa' },
    { code: '+254', country: 'Kenya' },
    { code: '+233', country: 'Ghana' },
    { code: '+256', country: 'Uganda' },
  ];
  
  for (const { code } of countryCodes) {
    if (phone.startsWith(code)) {
      return code;
    }
  }
  
  return null;
}