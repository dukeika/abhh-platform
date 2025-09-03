// File: src/services/jobService.ts
import { generateClient } from 'aws-amplify/api';
import { listJobs, getJob } from '@/graphql/queries';
import { createJob, updateJob, deleteJob } from '@/graphql/mutations';
import { Job, CreateJobInput, UpdateJobInput, JobStatus } from '@/API';

// Custom query that includes company details
const listJobsWithCompany = /* GraphQL */ `
  query ListJobsWithCompany($filter: ModelJobFilterInput, $limit: Int, $nextToken: String) {
    listJobs(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        department
        location
        type
        salary
        description
        requirements
        responsibilities
        benefits
        status
        companyId
        company {
          id
          name
          email
          phone
          address
          website
          logo
          description
          isActive
          __typename
        }
        createdAt
        updatedAt
        closingDate
        __typename
      }
      nextToken
      __typename
    }
  }
`;

const client = generateClient({
  authMode: 'apiKey'
});

export const jobService = {
  // Get all jobs (for super admin)
  async getAllJobs(): Promise<Job[]> {
    try {
      const result = await client.graphql({ 
        query: listJobsWithCompany
      });
      return result.data.listJobs.items as Job[];
    } catch (error) {
      console.error('Error fetching all jobs:', error);
      throw error;
    }
  },

  // Get all active jobs for candidates
  async getActiveJobs(): Promise<Job[]> {
    try {
      const result = await client.graphql({ 
        query: listJobsWithCompany,
        variables: {
          filter: {
            status: { eq: JobStatus.ACTIVE }
          }
        }
      });
      return result.data.listJobs.items as Job[];
    } catch (error) {
      console.error('Error fetching active jobs:', error);
      throw error;
    }
  },

  // Get jobs for a specific company
  async getJobsByCompany(companyId: string): Promise<Job[]> {
    try {
      const result = await client.graphql({ 
        query: listJobsWithCompany,
        variables: {
          filter: {
            companyId: { eq: companyId }
          }
        }
      });
      return result.data.listJobs.items as Job[];
    } catch (error) {
      console.error('Error fetching company jobs:', error);
      throw error;
    }
  },

  // Get a single job
  async getJobById(id: string): Promise<Job | null> {
    try {
      const result = await client.graphql({ 
        query: getJob,
        variables: { id }
      });
      return result.data.getJob as Job;
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  },

  // Create a new job (company admin only)
  async createJob(input: CreateJobInput): Promise<Job> {
    try {
      console.log('🔍 Creating job with input:', input);
      const result = await client.graphql({ 
        query: createJob,
        variables: { input }
      });
      console.log('✅ Job creation result:', result);
      return result.data.createJob as Job;
    } catch (error: any) {
      console.error('❌ Error creating job:', error);
      console.error('❌ Error details:', {
        message: error.message,
        errors: error.errors,
        data: error.data
      });
      throw error;
    }
  },

  // Update a job (company admin only)
  async updateJob(input: UpdateJobInput): Promise<Job> {
    try {
      const result = await client.graphql({ 
        query: updateJob,
        variables: { input }
      });
      return result.data.updateJob as Job;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  },

  // Delete a job (company admin only)
  async deleteJob(id: string): Promise<void> {
    try {
      await client.graphql({ 
        query: deleteJob,
        variables: { input: { id } }
      });
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }
};