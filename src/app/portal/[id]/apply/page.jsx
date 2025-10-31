"use client"

import { useState, useEffect, use, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { DomicileDropdown } from "@/components/ui/domicile-dropdown"
import { CountryCodeSelector } from "@/components/ui/country-code-selector"
import { CameraModal } from "@/components/ui/camera-modal"
import { ArrowLeft, Info, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

import { PortalGuard } from "@/components/auth/Portal-guard"

export default function ApplyPage({ params }) {
  return (
    <PortalGuard>
      <ApplyContent params={params} />
    </PortalGuard>
  )
}

function ApplyContent({ params }) {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef(null)
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [emailValid, setEmailValid] = useState(false)
  const [linkedinValid, setLinkedinValid] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  
  const resolvedParams = use(params)
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_country_code: '+62',
    phone_number: '',
    date_of_birth: '',
    domicile: '',
    gender: '',
    linkedin_link: ''
  })

  const fetchJobDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/jobs/${resolvedParams.id}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        setJob(result.data)
        if (result.data.application_form) {
          console.log('Application form fields:', result.data.application_form.fields)
        } else {
          console.log('No application_form found, using defaults')
        }
      }
    } catch (error) {
      console.error('Error fetching job details:', error)
      toast({
        variant: "destructive",
        title: "Failed to load job details",
      })
    } finally {
      setLoading(false)
    }
  }, [resolvedParams.id, toast])

  useEffect(() => {
    if (resolvedParams.id) {
      fetchJobDetails()
    }
  }, [resolvedParams.id, fetchJobDetails])

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateLinkedIn = (url) => {
    if (!url) return false
    const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/
    return linkedinRegex.test(url)
  }

  const validatePhoneNumber = (phone) => {
    if (!phone) return false
    const phoneRegex = /^[0-9]{9,13}$/
    return phoneRegex.test(phone.replace(/\s+/g, ''))
  }


  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    if (touched[name] || errors[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({
        ...prev,
        [name]: error
      }))
    }

    if (name === 'email') {
      setEmailValid(value.trim() !== '' && validateEmail(value))
    }

    if (name === 'linkedin_link') {
      setLinkedinValid(value.trim() !== '' && validateLinkedIn(value))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))

    const error = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleTakePicture = () => {
    setIsCameraOpen(true)
  }

  const handleCameraCapture = (file) => {
    setProfilePhoto(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const getFieldConfig = (key) => {
    if (!job?.application_form?.fields || !Array.isArray(job.application_form.fields)) return null
    return job.application_form.fields.find(f => f.key === key)
  }

  const getFieldLabel = (key) => {
    const field = getFieldConfig(key)
    if (field?.label) return field.label
    
    const labels = {
      full_name: 'Full name',
      email: 'Email',
      phone_number: 'Phone number',
      date_of_birth: 'Date of birth',
      domicile: 'Domicile',
      gender: 'Gender',
      linkedin_link: 'LinkedIn link',
      photo_profile: 'Photo profile'
    }
    return labels[key] || key
  }

  const validateField = (key, value) => {
    if (!isFieldEnabled(key)) {
      return null
    }

    if (isFieldRequired(key)) {
      if (key === 'photo_profile') {
        if (!profilePhoto) {
          return 'Photo profile is required'
        }
      } else if (key === 'email') {
        if (!value || value.trim() === '') {
          return 'Email is required'
        }
        if (!validateEmail(value)) {
          return 'Please enter a valid email address'
        }
      } else if (key === 'linkedin_link') {
        if (!value || value.trim() === '') {
          return 'LinkedIn link is required'
        }
        if (!validateLinkedIn(value)) {
          return 'Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/username)'
        }
      } else if (key === 'phone_number') {
        if (!value || value.trim() === '') {
          return 'Phone number is required'
        }
        if (!validatePhoneNumber(value)) {
          return 'Please enter a valid phone number (9-13 digits)'
        }
      } else {
        if (!value || value.toString().trim() === '') {
          return `${getFieldLabel(key)} is required`
        }
      }
    } else {
      if (key === 'email' && value && !validateEmail(value)) {
        return 'Please enter a valid email address'
      }
      if (key === 'linkedin_link' && value && !validateLinkedIn(value)) {
        return 'Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/username)'
      }
      if (key === 'phone_number' && value && !validatePhoneNumber(value)) {
        return 'Please enter a valid phone number (9-13 digits)'
      }
    }

    return null
  }

  const isFieldRequired = (key) => {
    if (!job?.application_form?.fields || !Array.isArray(job.application_form.fields) || job.application_form.fields.length === 0) {
      const defaultRequired = ['full_name', 'email', 'phone_number', 'date_of_birth', 'domicile', 'gender', 'linkedin_link']
      return defaultRequired.includes(key)
    }
    const field = getFieldConfig(key)
    if (!field || !field.validation) return false
    return field.validation.required === true
  }

  const isFieldEnabled = (key) => {
    if (!job?.application_form?.fields || !Array.isArray(job.application_form.fields) || job.application_form.fields.length === 0) {
      const defaultEnabled = ['full_name', 'email', 'phone_number', 'date_of_birth', 'domicile', 'gender', 'linkedin_link', 'photo_profile']
      return defaultEnabled.includes(key)
    }
    const field = getFieldConfig(key)
    if (!field) {
      return false
    }
    return field.validation !== null && field.validation !== undefined
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const enabledFields = job?.application_form?.fields 
      ? job.application_form.fields.map(f => f.key)
      : ['full_name', 'email', 'phone_number', 'date_of_birth', 'domicile', 'gender', 'linkedin_link', 'photo_profile']

    const newErrors = {}
    let hasErrors = false

    enabledFields.forEach(key => {
      let value = formData[key]
      if (key === 'photo_profile') {
        value = profilePhoto
      }
      
      const error = validateField(key, value)
      if (error) {
        newErrors[key] = error
        hasErrors = true
      }
    })

    setTouched(prev => {
      const newTouched = { ...prev }
      enabledFields.forEach(key => {
        newTouched[key] = true
      })
      return newTouched
    })

    setErrors(newErrors)

    if (hasErrors) {
      toast({
        variant: "destructive",
        title: "Please fix the errors in the form",
        description: "Some fields have validation errors. Please check and correct them.",
      })
      return
    }

    setSubmitting(true)

    try {
      const enabledFields = job?.application_form?.fields 
        ? job.application_form.fields.map(f => f.key)
        : ['full_name', 'email', 'phone_number', 'date_of_birth', 'domicile', 'gender', 'linkedin_link', 'photo_profile']

      const submitData = {}
      
      if (isFieldEnabled('photo_profile') && profilePhoto) {
        const photoBase64 = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = () => resolve(null)
          reader.readAsDataURL(profilePhoto)
        })
        if (photoBase64) {
          submitData.photo_profile = photoBase64
        }
      }
      
      for (const key of enabledFields) {
        if (key === 'phone_number' && isFieldEnabled('phone_number')) {
          submitData[key] = `${formData.phone_country_code || '+62'}${formData.phone_number || ''}`
        } else if (key === 'photo_profile') {
          continue
        } else if (formData.hasOwnProperty(key)) {
          submitData[key] = formData[key]
        }
      }

      const response = await fetch(`/api/jobs/${resolvedParams.id}/candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      })

      const result = await response.json()

      if (result.success) {
        router.push(`/portal/${resolvedParams.id}/apply/success`)
      } else {
        toast({
          variant: "destructive",
          title: "Failed to submit application",
          description: result.error?.message || "Please try again.",
        })
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Please try again.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="p-0"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold text-gray-900">
                  Apply {job?.title} at Rakamin
                </h1>
              </div>
              {job?.application_form?.fields?.some(f => f.validation?.required) && (
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Info className="h-4 w-4" />
                  <span>Fields marked with * are required</span>
                </div>
              )}
            </div>
            {job?.application_form?.fields?.some(f => f.validation?.required) && (
              <p className="text-sm text-red-600 ml-8">* Required</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
          {isFieldEnabled('photo_profile') && (
            <div>
              <Label className="mb-3 block">
                Photo Profile 
                {isFieldRequired('photo_profile') ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="text-gray-500 text-sm font-normal"> (Optional)</span>
                )}
              </Label>
              <div className="flex items-start gap-6">
                <div className="flex flex-col items-center">
                  <div className={`w-24 h-24 rounded-full bg-gray-200 border-2 overflow-hidden flex items-center justify-center ${errors.photo_profile && touched.photo_profile ? 'border-red-500' : 'border-gray-300'}`}>
                    {photoPreview ? (
                      <Image
                        src={photoPreview}
                        alt="Profile preview"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src="/avatar-profile.svg"
                        alt="Default profile"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      handlePhotoChange(e)
                      if (touched.photo_profile || errors.photo_profile) {
                        const file = e.target.files?.[0]
                        const error = validateField('photo_profile', file)
                        setErrors(prev => ({
                          ...prev,
                          photo_profile: error
                        }))
                      }
                    }}
                    onBlur={() => {
                      setTouched(prev => ({
                        ...prev,
                        photo_profile: true
                      }))
                      const error = validateField('photo_profile', profilePhoto)
                      setErrors(prev => ({
                        ...prev,
                        photo_profile: error
                      }))
                    }}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={handleTakePicture}
                    variant="outline"
                    className="mt-3 text-sm"
                  >
                    Take a Picture
                  </Button>
                </div>
              </div>
              {errors.photo_profile && touched.photo_profile && (
                <p className="mt-1 text-sm text-red-600">{errors.photo_profile}</p>
              )}
            </div>
          )}

          {isFieldEnabled('full_name') && (
            <div>
              <Label htmlFor="full_name">
                Full name
                {isFieldRequired('full_name') ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="text-gray-500 text-sm font-normal ml-2">(Optional)</span>
                )}
              </Label>
              <Input
                id="full_name"
                name="full_name"
                {...(isFieldRequired('full_name') && { required: true })}
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 ${errors.full_name && touched.full_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.full_name && touched.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
              )}
            </div>
          )}

          {isFieldEnabled('date_of_birth') && (
            <div>
              <Label htmlFor="date_of_birth">
                Date of birth
                {isFieldRequired('date_of_birth') ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="text-gray-500 text-sm font-normal ml-2">(Optional)</span>
                )}
              </Label>
              <div className="mt-1">
                <DatePicker
                  value={formData.date_of_birth}
                  onChange={(value) => {
                    setFormData({ ...formData, date_of_birth: value })
                    if (touched.date_of_birth || errors.date_of_birth) {
                      const error = validateField('date_of_birth', value)
                      setErrors(prev => ({
                        ...prev,
                        date_of_birth: error
                      }))
                    }
                  }}
                  onBlur={() => {
                    setTouched(prev => ({
                      ...prev,
                      date_of_birth: true
                    }))
                    const error = validateField('date_of_birth', formData.date_of_birth)
                    setErrors(prev => ({
                      ...prev,
                      date_of_birth: error
                    }))
                  }}
                  placeholder="Select your date of birth"
                  className={errors.date_of_birth && touched.date_of_birth ? 'border-red-500' : ''}
                />
              </div>
              {errors.date_of_birth && touched.date_of_birth && (
                <p className="mt-1 text-sm text-red-600">{errors.date_of_birth}</p>
              )}
            </div>
          )}

          {isFieldEnabled('gender') && (
            <div>
              <Label>
                Pronoun (gender)
                {isFieldRequired('gender') ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="text-gray-500 text-sm font-normal ml-2">(Optional)</span>
                )}
              </Label>
              <div className="mt-2 flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={formData.gender === 'Female'}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    {...(isFieldRequired('gender') && { required: true })}
                    className="w-4 h-4 text-teal-600"
                  />
                  <span>She/her (Female)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={formData.gender === 'Male'}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    {...(isFieldRequired('gender') && { required: true })}
                    className="w-4 h-4 text-teal-600"
                  />
                  <span>He/him (Male)</span>
                </label>
              </div>
              {errors.gender && touched.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
              )}
            </div>
          )}

          {isFieldEnabled('domicile') && (
            <div>
              <Label htmlFor="domicile">
                Domicile
                {isFieldRequired('domicile') ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="text-gray-500 text-sm font-normal ml-2">(Optional)</span>
                )}
              </Label>
              <div className="mt-1">
                <DomicileDropdown
                  value={formData.domicile}
                  onChange={(value) => {
                    setFormData({ ...formData, domicile: value })
                    if (touched.domicile || errors.domicile) {
                      const error = validateField('domicile', value)
                      setErrors(prev => ({
                        ...prev,
                        domicile: error
                      }))
                    }
                  }}
                  onBlur={() => {
                    setTouched(prev => ({
                      ...prev,
                      domicile: true
                    }))
                    const error = validateField('domicile', formData.domicile)
                    setErrors(prev => ({
                      ...prev,
                      domicile: error
                    }))
                  }}
                  placeholder="Choose your domicile"
                  className={errors.domicile && touched.domicile ? 'border-red-500' : ''}
                />
              </div>
              {errors.domicile && touched.domicile && (
                <p className="mt-1 text-sm text-red-600">{errors.domicile}</p>
              )}
            </div>
          )}

          {isFieldEnabled('phone_number') && (
            <div>
              <Label>
                Phone number
                {isFieldRequired('phone_number') ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="text-gray-500 text-sm font-normal ml-2">(Optional)</span>
                )}
              </Label>
              <div className="mt-1 flex gap-2">
                <CountryCodeSelector
                  value={formData.phone_country_code}
                  onChange={(code) => setFormData({ ...formData, phone_country_code: code })}
                />
                <Input
                  id="phone_number"
                  name="phone_number"
                  {...(isFieldRequired('phone_number') && { required: true })}
                  placeholder="81XXXXXXXXX"
                  value={formData.phone_number}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`flex-1 ${errors.phone_number && touched.phone_number ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
              </div>
              {errors.phone_number && touched.phone_number && (
                <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
              )}
            </div>
          )}

          {isFieldEnabled('email') && (
            <div>
              <Label htmlFor="email">
                Email
                {isFieldRequired('email') ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="text-gray-500 text-sm font-normal ml-2">(Optional)</span>
                )}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                {...(isFieldRequired('email') && { required: true })}
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 ${errors.email && touched.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.email && touched.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
              {emailValid && !errors.email && (
                <div className="mt-2 flex items-center gap-2 text-teal-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm">Email address found</span>
                </div>
              )}
            </div>
          )}

          {isFieldEnabled('linkedin_link') && (
            <div>
              <Label htmlFor="linkedin_link">
                Link Linkedin
                {isFieldRequired('linkedin_link') ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="text-gray-500 text-sm font-normal ml-2">(Optional)</span>
                )}
              </Label>
              <Input
                id="linkedin_link"
                name="linkedin_link"
                type="url"
                {...(isFieldRequired('linkedin_link') && { required: true })}
                placeholder="https://linkedin.com/in/username"
                value={formData.linkedin_link}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 ${errors.linkedin_link && touched.linkedin_link ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.linkedin_link && touched.linkedin_link && (
                <p className="mt-1 text-sm text-red-600">{errors.linkedin_link}</p>
              )}
              {linkedinValid && !errors.linkedin_link && (
                <div className="mt-2 flex items-center gap-2 text-teal-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm">URL address found</span>
                </div>
              )}
            </div>
          )}

          <div className="pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
          </form>
        </div>
      </div>

      <CameraModal
        open={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  )
}
