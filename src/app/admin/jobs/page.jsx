"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown } from "lucide-react";
import Image from "next/image";
import { EmptyJobsState } from "@/components/jobs/EmptyJobsState";
import { CreateJobModal } from "@/components/jobs/CreateJobModal";
import { JobCard } from '@/components/jobs/JobCard'
import { UserAvatar } from "@/components/ui/user-avatar";
import { AuthGuard } from "@/components/auth/Auth-guard";

export default function JobsListPage() {
  return (
    <AuthGuard requireAdmin={true}>
      <JobsListContent />
    </AuthGuard>
  );
}

function JobsListContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs');
      const data = await response.json();
      
      if (data.success && data.data) {
        setJobs(data.data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY < 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({
      top: 400,
      behavior: "smooth",
    });
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJobCreated = () => {
    fetchJobs();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">Job List</h1>

            <UserAvatar />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="relative mb-6">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-7 w-7 text-cyan-700" />
              <Input
                type="text"
                placeholder="Search by job details"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Loading...</div>
              </div>
            ) : filteredJobs.length === 0 ? (
              <EmptyJobsState />
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>

          <div className="w-full lg:w-80">
            <CreateJobCard onJobCreated={handleJobCreated} />
          </div>
        </div>
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToContent}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 bg-cyan-700 hover:bg-cyan-800 text-white rounded-full p-3 shadow-lg animate-bounce transition-all"
          aria-label="Scroll down"
        >
          <ChevronDown className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}

function CreateJobCard({ onJobCreated }) {
  return (
      <CreateJobModal onJobCreated={onJobCreated}>
        <div className="bg-gray-900 rounded-lg p-6 text-white relative overflow-hidden cursor-pointer hover:bg-gray-800 transition-colors">
          <div className="absolute inset-0 opacity-10">
          <Image
            src="/create-jobs.jpg"
            alt="Background"
            fill
            className="object-cover"
          />
        </div>

        <div className="relative z-10">
          <h3 className="text-lg font-semibold mb-2">
            Recruit the best candidates
          </h3>
          <p className="text-gray-300 text-sm mb-6">
            Create jobs, invite, and hire with ease
          </p>

          <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 px-4 rounded-lg font-medium text-center">
            Create a new job
          </Button>
        </div>
      </div>
    </CreateJobModal>
  );
}
