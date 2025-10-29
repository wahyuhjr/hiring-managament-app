"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function CreateJobModal({ children, onJobCreated }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const [jobName, setJobName] = useState("");
  const [jobType, setJobType] = useState("");
  const [department, setDepartment] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [candidatesNeeded, setCandidatesNeeded] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [profileFields, setProfileFields] = useState({
    "Full name": "mandatory",
    "Photo Profile": "mandatory",
    Gender: "mandatory",
    Domicile: "mandatory",
    Email: "mandatory",
    "Phone number": "mandatory",
    "Linkedin link": "mandatory",
    "Date of birth": "mandatory",
  });

  const handleFieldChange = (field, value) => {
    setProfileFields((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid = 
    jobName.trim() !== "" &&
    jobType !== "" &&
    department.trim() !== "" &&
    jobDescription.trim() !== "" &&
    candidatesNeeded.trim() !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formatSalary = (salaryStr) => {
        return parseInt(salaryStr) || 0;
      };

      const applicationForm = {
        fields: Object.keys(profileFields).map((field, index) => {
          const fieldMap = {
            'Full name': 'full_name',
            'Photo Profile': 'photo_profile',
            'Gender': 'gender',
            'Domicile': 'domicile',
            'Email': 'email',
            'Phone number': 'phone_number',
            'Linkedin link': 'linkedin_link',
            'Date of birth': 'date_of_birth'
          };

          const validationMap = {
            'mandatory': { required: true },
            'optional': { required: false },
            'off': null
          };

          return {
            key: fieldMap[field] || field.toLowerCase().replace(/\s+/g, '_'),
            label: field,
            validation: validationMap[profileFields[field]],
            order: index + 1
          };
        }).filter(field => field.validation !== null)
      };

      const isFormComplete = isFormValid && 
        minSalary.trim() !== "" && 
        maxSalary.trim() !== "" &&
        Object.values(profileFields).every(field => field !== "");

      const jobData = {
        title: jobName,
        department: department,
        description: jobDescription,
        status: isFormComplete ? 'ACTIVE' : 'DRAFT',
        salary_min: formatSalary(minSalary),
        salary_max: formatSalary(maxSalary),
        currency: 'IDR',
        application_form: applicationForm
      };

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (response.ok) {
        if (onJobCreated) {
          onJobCreated();
        }
        
        toast({
          variant: "success",
          title: isFormComplete ? "Job vacancy successfully created" : "Job saved as draft",
          description: isFormComplete ? "Your job is now active and visible to candidates" : "Complete the form to publish your job",
        });
        
        setJobName("");
        setJobType("");
        setDepartment("");
        setJobDescription("");
        setCandidatesNeeded("");
        setMinSalary("");
        setMaxSalary("");
        setProfileFields({
          "Full name": "mandatory",
          "Photo Profile": "mandatory",
          Gender: "mandatory",
          Domicile: "mandatory",
          Email: "mandatory",
          "Phone number": "mandatory",
          "Linkedin link": "mandatory",
          "Date of birth": "mandatory",
        });
        
        setOpen(false);
      } else {
        console.error('Failed to create job');
        toast({
          variant: "default",
          title: "Failed to create job",
          description: "Please try again.",
        });
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast({
        variant: "default",
        title: "An error occurred",
        description: "Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Job Opening</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Details Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Job Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobName" className="text-sm font-medium">
                  Job Name<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="jobName"
                  placeholder="Ex. Front End Engineer"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobType" className="text-sm font-medium">
                  Job Type<span className="text-red-500">*</span>
                </Label>
                <select
                  id="jobType"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select job type</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium">
                  Department<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="department"
                  placeholder="Ex. Engineering"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription" className="text-sm font-medium">
                Job Description<span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="jobDescription"
                placeholder="Ex."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="candidatesNeeded"
                className="text-sm font-medium"
              >
                Number of Candidate Needed
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="candidatesNeeded"
                type="number"
                placeholder="Ex. 2"
                value={candidatesNeeded}
                onChange={(e) => setCandidatesNeeded(e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          {/* Job Salary Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Job Salary</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="minSalary"
                  className="text-sm font-medium"
                >
                  Minimum Estimated Salary
                </Label>
                <div className="relative">
                  <Input
                    id="minSalary"
                    type="number"
                    placeholder="7000000"
                    value={minSalary}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setMinSalary(value);
                    }}
                    className="h-10 pl-10"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    Rp
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="maxSalary"
                  className="text-sm font-medium"
                >
                  Maximum Estimated Salary
                </Label>
                <div className="relative">
                  <Input
                    id="maxSalary"
                    type="number"
                    placeholder="8000000"
                    value={maxSalary}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setMaxSalary(value);
                    }}
                    className="h-10 pl-10"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    Rp
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Minimum Profile Information Required */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Minimum Profile Information Required
            </h3>

            {/* Card Wrapper */}
            <div className="border border-gray-200 rounded-lg bg-white p-4 shadow-sm">
              <div className="space-y-3">
                {Object.keys(profileFields).map((field) => (
                  <div
                    key={field}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <Label className="text-sm font-medium text-gray-700">
                      {field}
                    </Label>
                    <div className="flex gap-2">
                      {["mandatory", "optional", "off"].map((option) => {
                        const isRestrictedField =
                          field === "Full name" ||
                          field === "Photo Profile" ||
                          field === "Email";

                        const isDisabled =
                          isRestrictedField && option !== "mandatory";

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => !isDisabled && handleFieldChange(field, option)}
                            disabled={isDisabled}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                              profileFields[field] === option
                                ? "bg-white text-cyan-500 border border-cyan-500 shadow-md"
                                : isDisabled
                                ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                                : "bg-white text-gray-600 border border-gray-300 hover:border-gray-400 hover:shadow-sm"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="bg-cyan-700 text-white hover:bg-cyan-800 transition-colors"
            >
              {isFormValid ? 'Publish Job' : 'Save as Draft'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

