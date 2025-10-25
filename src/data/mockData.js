export const mockJobs = [
    {
      id: "job_20251001_0001",
      slug: "frontend-developer",
      title: "Frontend Developer",
      description: "We are looking for a skilled Frontend Developer to join our team and help build amazing user experiences.",
      department: "Engineering",
      status: "active",
      salary_range: {
        min: 7000000,
        max: 8000000,
        currency: "IDR",
        display_text: "Rp7.000.000 - Rp8.000.000"
      },
      list_card: {
        badge: "Active",
        started_on_text: "started on 1 Oct 2025",
        cta: "Manage Job"
      },
      created_at: "2025-01-01T00:00:00Z",
      application_form: {
        sections: [
          {
            title: "Minimum Profile Information Required",
            fields: [
              { key: "full_name", label: "Full Name", validation: { required: true } },
              { key: "photo_profile", label: "Profile Picture", validation: { required: true } },
              { key: "gender", label: "Gender", validation: { required: true } },
              { key: "domicile", label: "Domicile", validation: { required: false } },
              { key: "email", label: "Email", type: "email", validation: { required: true } },
              { key: "phone_number", label: "Phone Number", type: "tel", validation: { required: true } },
              { key: "linkedin_link", label: "LinkedIn Profile", type: "url", validation: { required: true } },
              { key: "date_of_birth", label: "Date of Birth", type: "date", validation: { required: false } }
            ]
          }
        ]
      }
    },
    {
      id: "job_20251002_0002",
      slug: "backend-developer",
      title: "Backend Developer",
      description: "Join our backend team to build scalable and robust server-side applications.",
      department: "Engineering",
      status: "active",
      salary_range: {
        min: 8000000,
        max: 10000000,
        currency: "IDR",
        display_text: "Rp8.000.000 - Rp10.000.000"
      },
      list_card: {
        badge: "Active",
        started_on_text: "started on 2 Oct 2025",
        cta: "Manage Job"
      },
      created_at: "2025-01-02T00:00:00Z",
      application_form: {
        sections: [
          {
            title: "Minimum Profile Information Required",
            fields: [
              { key: "full_name", label: "Full Name", validation: { required: true } },
              { key: "email", label: "Email", type: "email", validation: { required: true } },
              { key: "phone_number", label: "Phone Number", type: "tel", validation: { required: true } },
              { key: "linkedin_link", label: "LinkedIn Profile", type: "url", validation: { required: false } }
            ]
          }
        ]
      }
    }
  ]
  
  export const mockCandidates = [
    {
      id: "cand_20251008_0001",
      job_id: "job_20251001_0001",
      attributes: [
        { key: "full_name", label: "Full Name", value: "Nadia Putri", order: 1 },
        { key: "email", label: "Email", value: "nadia.putri@example.com", order: 2 },
        { key: "phone_number", label: "Phone", value: "+62 812-1234-5678", order: 3 },
        { key: "domicile", label: "Domicile", value: "Jakarta", order: 4 },
        { key: "gender", label: "Gender", value: "Female", order: 5 },
        { key: "linkedin_link", label: "LinkedIn", value: "https://linkedin.com/in/nadiaputri", order: 6 }
      ],
      applied_at: "2025-01-08T10:30:00Z"
    },
    {
      id: "cand_20251009_0002",
      job_id: "job_20251001_0001",
      attributes: [
        { key: "full_name", label: "Full Name", value: "Ahmad Rizki", order: 1 },
        { key: "email", label: "Email", value: "ahmad.rizki@example.com", order: 2 },
        { key: "phone_number", label: "Phone", value: "+62 813-5678-9012", order: 3 },
        { key: "domicile", label: "Domicile", value: "Bandung", order: 4 },
        { key: "gender", label: "Gender", value: "Male", order: 5 },
        { key: "linkedin_link", label: "LinkedIn", value: "https://linkedin.com/in/ahmadrizki", order: 6 }
      ],
      applied_at: "2025-01-09T14:20:00Z"
    }
  ]