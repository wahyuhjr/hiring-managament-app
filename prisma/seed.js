const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data
  await prisma.application.deleteMany()
  await prisma.job.deleteMany()
  console.log('✅ Cleared existing data')

  // Create sample jobs
  const jobs = [
    {
      title: 'Senior Frontend Developer',
      slug: 'senior-frontend-developer',
      description: 'We are looking for an experienced Frontend Developer to join our team. You will be responsible for building beautiful and responsive user interfaces.',
      department: 'Engineering',
      status: 'ACTIVE',
      salaryMin: 15000000,
      salaryMax: 25000000,
      currency: 'IDR',
      applicationForm: {
        fields: [
          {
            id: 'full_name',
            type: 'text',
            label: 'Full Name',
            required: true,
            placeholder: 'Enter your full name'
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email Address',
            required: true,
            placeholder: 'your.email@example.com'
          },
          {
            id: 'phone',
            type: 'tel',
            label: 'Phone Number',
            required: true,
            placeholder: '+62 812 3456 7890'
          },
          {
            id: 'portfolio',
            type: 'url',
            label: 'Portfolio URL',
            required: false,
            placeholder: 'https://yourportfolio.com'
          },
          {
            id: 'experience',
            type: 'number',
            label: 'Years of Experience',
            required: true,
            placeholder: '5'
          },
          {
            id: 'cover_letter',
            type: 'textarea',
            label: 'Cover Letter',
            required: true,
            placeholder: 'Tell us about yourself...'
          }
        ]
      }
    },
    {
      title: 'Backend Engineer',
      slug: 'backend-engineer',
      description: 'Join our backend team to build scalable and robust APIs. Experience with Node.js and databases required.',
      department: 'Engineering',
      status: 'ACTIVE',
      salaryMin: 18000000,
      salaryMax: 30000000,
      currency: 'IDR',
      applicationForm: {
        fields: [
          {
            id: 'full_name',
            type: 'text',
            label: 'Full Name',
            required: true
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email Address',
            required: true
          },
          {
            id: 'phone',
            type: 'tel',
            label: 'Phone Number',
            required: true
          },
          {
            id: 'github',
            type: 'url',
            label: 'GitHub Profile',
            required: true,
            placeholder: 'https://github.com/username'
          },
          {
            id: 'experience',
            type: 'number',
            label: 'Years of Experience',
            required: true
          }
        ]
      }
    },
    {
      title: 'Product Designer',
      slug: 'product-designer',
      description: 'We need a creative Product Designer to help us create amazing user experiences.',
      department: 'Design',
      status: 'ACTIVE',
      salaryMin: 12000000,
      salaryMax: 20000000,
      currency: 'IDR',
      applicationForm: {
        fields: [
          {
            id: 'full_name',
            type: 'text',
            label: 'Full Name',
            required: true
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email Address',
            required: true
          },
          {
            id: 'portfolio',
            type: 'url',
            label: 'Portfolio URL',
            required: true,
            placeholder: 'https://dribbble.com/username or https://behance.net/username'
          },
          {
            id: 'figma_profile',
            type: 'url',
            label: 'Figma Profile',
            required: false
          }
        ]
      }
    },
    {
      title: 'Marketing Manager',
      slug: 'marketing-manager',
      description: 'Lead our marketing initiatives and grow our brand presence.',
      department: 'Marketing',
      status: 'DRAFT',
      salaryMin: 15000000,
      salaryMax: 25000000,
      currency: 'IDR',
      applicationForm: {
        fields: [
          {
            id: 'full_name',
            type: 'text',
            label: 'Full Name',
            required: true
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email Address',
            required: true
          },
          {
            id: 'linkedin',
            type: 'url',
            label: 'LinkedIn Profile',
            required: true
          },
          {
            id: 'experience',
            type: 'number',
            label: 'Years of Experience',
            required: true
          }
        ]
      }
    },
    {
      title: 'Data Analyst',
      slug: 'data-analyst',
      description: 'Help us make data-driven decisions by analyzing our business metrics.',
      department: 'Data',
      status: 'INACTIVE',
      salaryMin: 10000000,
      salaryMax: 18000000,
      currency: 'IDR',
      applicationForm: {
        fields: [
          {
            id: 'full_name',
            type: 'text',
            label: 'Full Name',
            required: true
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email Address',
            required: true
          },
          {
            id: 'sql_experience',
            type: 'select',
            label: 'SQL Experience Level',
            required: true,
            options: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
          }
        ]
      }
    }
  ]

  console.log('📝 Creating jobs...')
  
  for (const jobData of jobs) {
    const job = await prisma.job.create({
      data: jobData
    })
    console.log(`  ✅ Created job: ${job.title} (${job.status})`)
  }

  // Create sample applications for the first job
  const firstJob = await prisma.job.findFirst({
    where: { slug: 'senior-frontend-developer' }
  })

  if (firstJob) {
    console.log('📋 Creating sample applications...')
    
    const applications = [
      {
        jobId: firstJob.id,
        status: 'PENDING',
        formData: {
          full_name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+62 812 3456 7890',
          portfolio: 'https://johndoe.dev',
          experience: 5,
          cover_letter: 'I am passionate about frontend development and have 5 years of experience building modern web applications.'
        }
      },
      {
        jobId: firstJob.id,
        status: 'REVIEWED',
        formData: {
          full_name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+62 813 9876 5432',
          portfolio: 'https://janesmith.com',
          experience: 7,
          cover_letter: 'I specialize in React and have led multiple successful projects.'
        }
      },
      {
        jobId: firstJob.id,
        status: 'ACCEPTED',
        formData: {
          full_name: 'Bob Wilson',
          email: 'bob.wilson@example.com',
          phone: '+62 815 1234 5678',
          portfolio: 'https://bobwilson.dev',
          experience: 8,
          cover_letter: 'Senior developer with expertise in modern frontend frameworks and performance optimization.'
        }
      }
    ]

    for (const appData of applications) {
      const application = await prisma.application.create({
        data: appData
      })
      console.log(`  ✅ Created application from: ${application.formData.full_name} (${application.status})`)
    }
  }

  console.log('\n🎉 Seed completed successfully!')
  console.log(`\n📊 Summary:`)
  console.log(`  - Jobs: ${jobs.length}`)
  console.log(`  - Applications: 3`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
