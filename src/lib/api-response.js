export function jobListResponse(jobs) {
  return {
    success: true,
    data: jobs,
    timestamp: new Date().toISOString()
  }
}

export function apiError(message, code = 500) {
  return {
    success: false,
    error: {
      message,
      code
    },
    timestamp: new Date().toISOString()
  }
}

export function handleApiError(error) {
  console.error('API Error:', error)
  
  if (error.code === '23505') {
    return apiError('Duplicate entry found', 409)
  }
  
  if (error.code === '23503') {
    return apiError('Foreign key constraint violation', 400)
  }
  
  if (error.code === '23502') {
    return apiError('Required field is missing', 400)
  }
  
  return apiError(error.message || 'Internal server error', 500)
}

