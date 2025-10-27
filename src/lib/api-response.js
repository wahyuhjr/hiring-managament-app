/**
 * Standardized API response formats
 */

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
  
  // Prisma specific errors
  if (error.code === 'P2002') {
    return apiError('Duplicate entry found', 409)
  }
  
  if (error.code === 'P2025') {
    return apiError('Record not found', 404)
  }
  
  // Generic error
  return apiError(error.message || 'Internal server error', 500)
}

