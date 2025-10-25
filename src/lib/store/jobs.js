import { create } from "zustand";
import { mockJobs, mockCandidates } from "@data/mockData";
import { resolve } from "styled-jsx/css";

export const useJobStore = create ((set,get) => ({
    jobs:[],
    candidates:[],
    loading: false,
    selectedJob: null,

    fetchJobs: async() => {
        set({ loading: true })
        await new Promise(resolve = setTimeout(resolve,500))
        set ({ jobs, mockJobs, loading: false })
    },

    fetchCandidates: async(jobId) => {
        set({ loading: true })
        await new Promise(resolve = setTimeout(resolve,300))
        const JobCandidates = mockCandidates.filter(c => c.job_id === jobId)
        set ({candidates: JobCandidates, loading: false})
    },

    addJobs: async (jobData) => {
        set ({ loading: true })
        const newJobs = {
            ...jobData,
            id: `job_${Date.now()}`,
            created_at: new Date().toISOString(),
        }

        await new Promise(resolve = setTimeout(resolve,500))
        set((state) => ({
            jobs: [...state.jobs, newJobs],
            loading: false
        }))
    },

    addCandidate: async (candidateData) => {
        const newCandidate = {
          ...candidateData,
          id: `cand_${Date.now()}`,
          applied_at: new Date().toISOString(),
        }
        
        set((state) => ({
          candidates: [...state.candidates, newCandidate]
        }))
      },

      setSelectedJob: (job) => set({ selectedJob: job }),
  setLoading: (loading) => set({ loading }),
      
}));