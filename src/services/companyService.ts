// File: src/services/companyService.ts
import { generateClient } from 'aws-amplify/api';
import { listCompanies, getCompany } from '@/graphql/queries';
import { createCompany, updateCompany, deleteCompany } from '@/graphql/mutations';
import { Company, CreateCompanyInput, UpdateCompanyInput } from '@/API';

const client = generateClient();

export const companyService = {
  // Get all companies (super admin only)
  async getAllCompanies(): Promise<Company[]> {
    try {
      const result = await client.graphql({ 
        query: listCompanies 
      });
      return result.data.listCompanies.items as Company[];
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  // Get a single company
  async getCompanyById(id: string): Promise<Company | null> {
    try {
      const result = await client.graphql({ 
        query: getCompany,
        variables: { id }
      });
      return result.data.getCompany as Company;
    } catch (error) {
      console.error('Error fetching company:', error);
      throw error;
    }
  },

  // Get active companies only
  async getActiveCompanies(): Promise<Company[]> {
    try {
      const result = await client.graphql({ 
        query: listCompanies,
        variables: {
          filter: {
            isActive: { eq: true }
          }
        }
      });
      return result.data.listCompanies.items as Company[];
    } catch (error) {
      console.error('Error fetching active companies:', error);
      throw error;
    }
  },

  // Create a new company (super admin only)
  async createCompany(input: CreateCompanyInput): Promise<Company> {
    try {
      const result = await client.graphql({ 
        query: createCompany,
        variables: { input }
      });
      return result.data.createCompany as Company;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  },

  // Update a company
  async updateCompany(input: UpdateCompanyInput): Promise<Company> {
    try {
      const result = await client.graphql({ 
        query: updateCompany,
        variables: { input }
      });
      return result.data.updateCompany as Company;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  },

  // Delete a company (super admin only)
  async deleteCompany(id: string): Promise<void> {
    try {
      await client.graphql({ 
        query: deleteCompany,
        variables: { input: { id } }
      });
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  },

  // Activate/deactivate company
  async toggleCompanyStatus(id: string, isActive: boolean): Promise<Company> {
    return this.updateCompany({ id, isActive });
  }
};