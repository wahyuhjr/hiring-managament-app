"use client";

import { useState, useEffect, useCallback, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ArrowLeft,
  Users,
  MoreVertical,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { UserAvatar } from "@/components/ui/user-avatar";
import { AuthGuard } from "@/components/auth/Auth-guard";
import { useToast } from "@/components/ui/use-toast";

export default function JobDetailPage({ params }) {
  return (
    <AuthGuard requireAdmin={true}>
      <JobDetailContent params={params} />
    </AuthGuard>
  );
}

function JobDetailContent({ params }) {
  const resolvedParams = use(params);
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchJobDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/jobs/${resolvedParams.id}`);
      const result = await response.json();

      if (result.success && result.data) {
        setJob(result.data);
      } else {
        console.error("Failed to fetch job details:", result);
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
    }
  }, [resolvedParams.id]);

  const fetchCandidates = useCallback(async () => {
    try {
      const response = await fetch(`/api/jobs/${resolvedParams.id}/candidates`);
      const result = await response.json();

      if (result.success && result.data) {
        setCandidates(result.data);
      } else {
        console.error("Failed to fetch candidates:", result);
        setCandidates([]);
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    if (resolvedParams.id) {
      fetchJobDetails();
      fetchCandidates();
    }
  }, [resolvedParams.id, fetchJobDetails, fetchCandidates]);

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`/api/jobs/${resolvedParams.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast({
          variant: "success",
          title: `Job status updated to ${newStatus.toLowerCase()}`,
        });

        setJob((prev) => ({ ...prev, status: newStatus.toLowerCase() }));
      } else {
        toast({
          variant: "destructive",
          title: "Failed to update job status",
          description: "Please try again.",
        });
      }
    } catch (error) {
      console.error("Error updating job status:", error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Please try again.",
      });
    }
  };

  const filteredCandidates = candidates.filter((candidate) =>
    candidate.attributes?.some((attr) =>
      attr.value?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Link
                href="/admin/jobs"
                className="text-gray-600 hover:text-gray-900"
              >
                Job list
              </Link>
              <ArrowLeft className="h-4 w-4 text-gray-400" />
              <Button
                variant="outline"
                size="sm"
                className="bg-gray-100 text-gray-700"
              >
                Manage Candidate
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <UserAvatar />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            {job?.title || "Loading..."}
          </h1>
          
          <div className="flex items-center gap-2">
            {job?.status !== "active" && (
              <Button
                onClick={() => handleStatusChange("ACTIVE")}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Eye className="h-4 w-4 mr-1" />
                Set Active
              </Button>
            )}
            {job?.status !== "inactive" && (
              <Button
                onClick={() => handleStatusChange("INACTIVE")}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                size="sm"
              >
                <EyeOff className="h-4 w-4 mr-1" />
                Set Inactive
              </Button>
            )}
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-7 w-7 text-cyan-700" />
          <Input
            type="text"
            placeholder="Search candidates"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {filteredCandidates.length === 0 ? (
          <EmptyCandidatesState />
        ) : (
          <CandidatesTable candidates={filteredCandidates} />
        )}
      </div>
    </div>
  );
}

function CandidatesTable({ candidates }) {
  const getCandidateValue = (candidate, key) => {
    return candidate.attributes?.find((attr) => attr.key === key)?.value || "-";
  };

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                NAMA LENGKAP
              </th>
              <th className="w-48 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                EMAIL ADDRESS
              </th>
              <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                PHONE NUMBERS
              </th>
              <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DATE OF BIRTH
              </th>
              <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DOMICILE
              </th>
              <th className="w-20 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                GENDER
              </th>
              <th className="w-48 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                LINK LINKEDIN
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {candidates.map((candidate) => (
              <tr key={candidate.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <input type="checkbox" className="rounded border-gray-300" />
                </td>
                <td className="px-4 py-4 text-sm font-medium text-gray-900 truncate">
                  {getCandidateValue(candidate, "full_name")}
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 truncate">
                  {getCandidateValue(candidate, "email")}
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 truncate">
                  {getCandidateValue(candidate, "phone_number")}
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 truncate">
                  {getCandidateValue(candidate, "date_of_birth")}
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 truncate">
                  {getCandidateValue(candidate, "domicile")}
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 truncate">
                  {getCandidateValue(candidate, "gender")}
                </td>
                <td className="px-4 py-4 text-sm text-blue-600 truncate">
                  <a
                    href={getCandidateValue(candidate, "linkedin_link")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    title={getCandidateValue(candidate, "linkedin_link")}
                  >
                    {getCandidateValue(candidate, "linkedin_link").length > 30
                      ? getCandidateValue(candidate, "linkedin_link").substring(
                          0,
                          30
                        ) + "..."
                      : getCandidateValue(candidate, "linkedin_link")}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyCandidatesState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-8">
        <Image
          src="/empty-candidate.svg"
          width={400}
          height={400}
          alt="No candidates found"
          className="mx-auto"
        />
      </div>

      {/* Text Content */}
      <div className="text-center max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No candidates found
        </h2>
        <p className="text-gray-600">
          Share your job vacancies so that more candidates will apply.
        </p>
      </div>
    </div>
  )
}
