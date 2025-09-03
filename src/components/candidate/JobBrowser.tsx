// src/components/candidate/JobBrowser.tsx
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building, 
  Calendar,
  ChevronRight,
  Briefcase
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  salary?: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits?: string[];
  status: "active" | "closed";
  createdAt: string;
  closingDate?: string;
  companyLogo?: string;
}

interface JobBrowserProps {
  jobs: Job[];
  onApply: (jobId: string, applicationData?: { coverLetter?: string; resumeUrl?: string }) => Promise<void>;
  hasApplied: (jobId: string) => boolean;
  loading?: boolean;
}

export default function JobBrowser({ jobs, onApply, hasApplied, loading = false }: JobBrowserProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applying, setApplying] = useState<string | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationJob, setApplicationJob] = useState<Job | null>(null);

  // Get unique filter options
  const locations = useMemo(() => 
    Array.from(new Set(jobs.map(job => job.location))).sort(), 
    [jobs]
  );
  const types = useMemo(() => 
    Array.from(new Set(jobs.map(job => job.type))).sort(), 
    [jobs]
  );
  const departments = useMemo(() => 
    Array.from(new Set(jobs.map(job => job.department))).sort(), 
    [jobs]
  );

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = !searchTerm || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLocation = !locationFilter || job.location === locationFilter;
      const matchesType = !typeFilter || job.type === typeFilter;
      const matchesDepartment = !departmentFilter || job.department === departmentFilter;
      
      return matchesSearch && matchesLocation && matchesType && matchesDepartment;
    });
  }, [jobs, searchTerm, locationFilter, typeFilter, departmentFilter]);

  const handleApply = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setApplicationJob(job);
      setShowApplicationModal(true);
    }
  };

  const handleSubmitApplication = async (applicationData: { coverLetter?: string; resumeUrl?: string }) => {
    if (!applicationJob) return;
    
    try {
      setApplying(applicationJob.id);
      await onApply(applicationJob.id, applicationData);
      setShowApplicationModal(false);
      setApplicationJob(null);
    } catch (error) {
      console.error('Error applying to job:', error);
    } finally {
      setApplying(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setTypeFilter("");
    setDepartmentFilter("");
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Find Your Next Opportunity</h2>
          <div className="text-sm text-gray-500">
            {filteredJobs.length} of {jobs.length} jobs
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search jobs, companies, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {(searchTerm || locationFilter || typeFilter || departmentFilter) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Job List */}
      <div className="divide-y">
        {filteredJobs.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || locationFilter || typeFilter || departmentFilter
                ? "Try adjusting your filters to see more opportunities"
                : "Check back soon for new opportunities"
              }
            </p>
            {(searchTerm || locationFilter || typeFilter || departmentFilter) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  {/* Company Logo and Header */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 font-medium">{job.company}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {job.type}
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-1" />
                          {job.department}
                        </div>
                        {job.salary && (
                          <div className="flex items-center text-green-600">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {job.salary}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Job Description */}
                  <p className="text-gray-600 mt-3 line-clamp-3">
                    {job.description}
                  </p>

                  {/* Tags */}
                  {job.requirements && job.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {job.requirements.slice(0, 3).map((req, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {req}
                        </span>
                      ))}
                      {job.requirements.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                          +{job.requirements.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Posted Date */}
                  <div className="flex items-center mt-3 text-sm text-gray-400">
                    <Calendar className="w-4 h-4 mr-1" />
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Apply Button */}
                <div className="flex flex-col space-y-2">
                  {hasApplied(job.id) ? (
                    <div className="text-center">
                      <span className="px-4 py-2 bg-green-100 text-green-800 text-sm rounded-lg font-medium">
                        Applied
                      </span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleApply(job.id)}
                      disabled={applying === job.id}
                      className="min-w-[100px]"
                    >
                      {applying === job.id ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Applying...
                        </div>
                      ) : (
                        'Apply Now'
                      )}
                    </Button>
                  )}
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={handleApply}
          hasApplied={hasApplied(selectedJob.id)}
          applying={applying === selectedJob.id}
        />
      )}

      {/* Job Application Modal */}
      {showApplicationModal && applicationJob && (
        <JobApplicationModal
          job={applicationJob}
          onClose={() => {
            setShowApplicationModal(false);
            setApplicationJob(null);
          }}
          onSubmit={handleSubmitApplication}
          applying={applying === applicationJob.id}
        />
      )}
    </div>
  );
}

// Job Detail Modal Component
interface JobDetailModalProps {
  job: Job;
  onClose: () => void;
  onApply: (jobId: string) => void;
  hasApplied: boolean;
  applying: boolean;
}

function JobDetailModal({ job, onClose, onApply, hasApplied, applying }: JobDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
            <p className="text-gray-600">{job.company}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Job Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-2" />
                {job.location}
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 mr-2" />
                {job.type}
              </div>
              <div className="flex items-center text-gray-600">
                <Briefcase className="w-5 h-5 mr-2" />
                {job.department}
              </div>
              {job.salary && (
                <div className="flex items-center text-green-600">
                  <DollarSign className="w-5 h-5 mr-2" />
                  {job.salary}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
            <div className="text-gray-600 whitespace-pre-line">{job.description}</div>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {job.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Responsibilities</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {job.responsibilities.map((resp, index) => (
                  <li key={index}>{resp}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {job.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-500">
            Posted {new Date(job.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {hasApplied ? (
              <span className="px-4 py-2 bg-green-100 text-green-800 text-sm rounded-lg font-medium">
                Applied
              </span>
            ) : (
              <Button
                onClick={() => onApply(job.id)}
                disabled={applying}
              >
                Apply Now
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Job Application Modal Component
interface JobApplicationModalProps {
  job: Job;
  onClose: () => void;
  onSubmit: (applicationData: { coverLetter?: string; resumeUrl?: string }) => Promise<void>;
  applying: boolean;
}

function JobApplicationModal({ job, onClose, onSubmit, applying }: JobApplicationModalProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const [errors, setErrors] = useState<{ coverLetter?: string }>({});

  const validateForm = () => {
    const newErrors: { coverLetter?: string } = {};
    
    if (!coverLetter.trim()) {
      newErrors.coverLetter = 'Cover letter is required';
    } else if (coverLetter.trim().length < 50) {
      newErrors.coverLetter = 'Cover letter should be at least 50 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({ coverLetter });
    } catch (error) {
      console.error('Error submitting application:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Apply for Position</h2>
            <p className="text-gray-600">{job.title} at {job.company}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            disabled={applying}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Job Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Position Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Location:</span>
                  <span className="ml-2 text-gray-900">{job.location}</span>
                </div>
                <div>
                  <span className="text-gray-600">Type:</span>
                  <span className="ml-2 text-gray-900">{job.type}</span>
                </div>
                <div>
                  <span className="text-gray-600">Department:</span>
                  <span className="ml-2 text-gray-900">{job.department}</span>
                </div>
                {job.salary && (
                  <div>
                    <span className="text-gray-600">Salary:</span>
                    <span className="ml-2 text-gray-900">{job.salary}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cover Letter */}
            <div>
              <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter *
              </label>
              <textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => {
                  setCoverLetter(e.target.value);
                  if (errors.coverLetter) {
                    setErrors({ ...errors, coverLetter: undefined });
                  }
                }}
                rows={8}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
                  errors.coverLetter ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Tell us why you're interested in this position and why you'd be a great fit..."
                disabled={applying}
              />
              {errors.coverLetter && (
                <p className="mt-1 text-sm text-red-600">{errors.coverLetter}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {coverLetter.length}/1000 characters
              </p>
            </div>

            {/* Resume Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Resume</h3>
                  <div className="mt-1 text-sm text-blue-700">
                    <p>Make sure your profile resume is up to date. Employers will review the resume from your profile.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={applying}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={applying || !coverLetter.trim()}
              className="min-w-[120px]"
            >
              {applying ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}