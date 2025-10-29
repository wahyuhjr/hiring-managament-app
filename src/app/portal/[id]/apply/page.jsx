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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    if (name === 'email') {
      setEmailValid(value.trim() !== '' && validateEmail(value))
    }

    if (name === 'linkedin_link') {
      setLinkedinValid(value.trim() !== '' && validateLinkedIn(value))
    }
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
    
    let requiredFields = []
    
    if (job?.application_form?.fields && job.application_form.fields.length > 0) {
      requiredFields = job.application_form.fields
        .filter(field => {
          if (!field.validation) return false
          return field.validation.required === true
        })
        .map(field => ({
          key: field.key,
          label: field.label || field.key
        }))
    } else if (!job?.application_form) {
      requiredFields = [
        { key: 'full_name', label: 'Full name' },
        { key: 'email', label: 'Email' },
        { key: 'phone_number', label: 'Phone number' },
        { key: 'date_of_birth', label: 'Date of birth' },
        { key: 'domicile', label: 'Domicile' },
        { key: 'gender', label: 'Gender' },
        { key: 'linkedin_link', label: 'LinkedIn link' }
      ]
    }

    const missingFields = requiredFields.filter(field => {
      if (field.key === 'photo_profile') {
        const value = profilePhoto
        return !value
      }
      const value = formData[field.key]
      if (value === undefined || value === null) return true
      if (typeof value === 'string' && value.trim() === '') return true
      return false
    })

    if (missingFields.length > 0) {
      toast({
        variant: "destructive",
        title: "Please fill all required fields",
        description: `Missing: ${missingFields.map(f => f.label || f.key).join(', ')}`,
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
                  <div className="w-24 h-24 rounded-full bg-gray-200 border-2 border-gray-300 overflow-hidden flex items-center justify-center">
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
                    onChange={handlePhotoChange}
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
                className="mt-1"
              />
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
                  onChange={(value) => setFormData({ ...formData, date_of_birth: value })}
                  placeholder="Select your date of birth"
                />
              </div>
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
                    {...(isFieldRequired('gender') && { required: true })}
                    className="w-4 h-4 text-teal-600"
                  />
                  <span>He/him (Male)</span>
                </label>
              </div>
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
                  onChange={(value) => setFormData({ ...formData, domicile: value })}
                  placeholder="Choose your domicile"
                />
              </div>
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
                  className="flex-1"
                />
              </div>
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
                className="mt-1"
              />
              {emailValid && (
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
                className="mt-1"
              />
              {linkedinValid && (
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
