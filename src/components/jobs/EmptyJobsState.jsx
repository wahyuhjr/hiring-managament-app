"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import Image from "next/image";

export function EmptyJobsState() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-8">
        <Image
          src="/no-job-opening-logo.svg"
          width={400}
          height={400}
          alt="no jobs opening"
        />
      </div>

      <div className="text-center max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No job openings available
        </h2>
        <p className="text-gray-600 mb-8">
          Create a job opening now and start the candidate process.
        </p>

        {user && (
          <div className="relative">
            <Link href="/admin/jobs/create">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium px-6">
                Create a new job
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
