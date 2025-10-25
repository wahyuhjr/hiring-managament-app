export const validateJob = (data) => {
    const errors = {}
  
    if (!data.title?.trim()) {
      errors.title = 'Job title is required'
    }
  
    if (!data.description?.trim() || data.description.length < 10) {
      errors.description = 'Description must be at least 10 characters'
    }
  
    if (!data.department?.trim()) {
      errors.department = 'Department is required'
    }
  
    if (!data.salary_min || data.salary_min < 0) {
      errors.salary_min = 'Minimum salary must be positive'
    }
  
    if (!data.salary_max || data.salary_max < 0) {
      errors.salary_max = 'Maximum salary must be positive'
    }
  
    if (data.salary_max < data.salary_min) {
      errors.salary_max = 'Maximum salary must be greater than minimum salary'
    }
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
  
  export const validateApplication = (data, fields) => {
    const errors = {}
    
    fields.forEach(field => {
      const value = data[field.key]
      
      if (field.validation.required && (!value || !value.toString().trim())) {
        errors[field.key] = `${field.label || field.key} is required`
        return
      }
  
      // Email validation
      if (field.key === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[field.key] = 'Invalid email format'
      }
  
      // Phone validation
      if (field.key === 'phone_number' && value && !/^[+]?[\d\s-()]+$/.test(value)) {
        errors[field.key] = 'Invalid phone number'
      }
  
      // URL validation
      if (field.key === 'linkedin_link' && value) {
        try {
          new URL(value)
        } catch {
          errors[field.key] = 'Invalid URL format'
        }
      }
    })
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }