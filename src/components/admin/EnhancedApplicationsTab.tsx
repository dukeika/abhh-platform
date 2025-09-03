// Enhanced ApplicationsTab with complete stage management and test review
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Users, Clock, CheckCircle, XCircle, ArrowRight, Eye, 
  MessageSquare, FileText, Video, Calendar, User, ThumbsUp, ThumbsDown,
  Play, Pause, MoreHorizontal, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { applicationService } from '@/services/applicationService';
import { testService } from '@/services/testService';
import { Application, ApplicationStatus, StageStatus, TestAttempt, VideoTestAttempt } from '@/API';
import TestReviewModal from './TestReviewModal';
import VideoTestReviewModal from './VideoTestReviewModal';

interface EnhancedApplicationsTabProps {
  companyId?: string;
  onRefresh?: () => void;
}

interface ApplicationWithDetails extends Application {
  candidateName: string;
  jobTitle: string;
  companyName: string;
}

export default function EnhancedApplicationsTab({ companyId, onRefresh }: EnhancedApplicationsTabProps) {
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | ''>('');
  const [stageFilter, setStageFilter] = useState<number | ''>('');
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null);
  const [showTestReview, setShowTestReview] = useState(false);
  const [showVideoReview, setShowVideoReview] = useState(false);
  const [reviewType, setReviewType] = useState<'written' | 'video'>('written');
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);

  useEffect(() => {
    loadApplications();
  }, [companyId]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      let applicationsData: Application[];
      
      if (companyId) {
        applicationsData = await applicationService.getApplicationsByCompany(companyId);
      } else {
        applicationsData = await applicationService.getAllApplications();
      }
      
      // Transform and enrich application data
      const enrichedApplications: ApplicationWithDetails[] = applicationsData.map(app => ({
        ...app,
        candidateName: `${app.candidate?.firstName || ''} ${app.candidate?.lastName || ''}`.trim(),
        jobTitle: app.job?.title || 'Unknown Job',
        companyName: app.job?.company?.name || 'Unknown Company',
      }));
      
      setApplications(enrichedApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const candidateName = app.candidateName.toLowerCase();
    const jobTitle = app.jobTitle.toLowerCase();
    const companyName = app.companyName.toLowerCase();
    
    const matchesSearch = searchTerm === '' || 
      candidateName.includes(searchTerm.toLowerCase()) ||
      jobTitle.includes(searchTerm.toLowerCase()) ||
      companyName.includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || app.overallStatus === statusFilter;
    const matchesStage = stageFilter === '' || app.currentStage === stageFilter;
    
    return matchesSearch && matchesStatus && matchesStage;
  });

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.ACTIVE:
        return 'bg-blue-100 text-blue-800';
      case ApplicationStatus.HIRED:
        return 'bg-green-100 text-green-800';
      case ApplicationStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case ApplicationStatus.WITHDRAWN:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageStatusColor = (status: StageStatus) => {
    switch (status) {
      case StageStatus.COMPLETED:
        return 'text-green-600 bg-green-100';
      case StageStatus.IN_PROGRESS:
        return 'text-blue-600 bg-blue-100';
      case StageStatus.PENDING:
        return 'text-yellow-600 bg-yellow-100';
      case StageStatus.FAILED:
        return 'text-red-600 bg-red-100';
      case StageStatus.SCHEDULED:
        return 'text-purple-600 bg-purple-100';
      case StageStatus.NOT_STARTED:
        return 'text-gray-500 bg-gray-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const getStageIcon = (stage: number, status: StageStatus) => {
    const stageIcons = [FileText, FileText, Video, Calendar];
    const Icon = stageIcons[stage - 1] || FileText;
    
    if (status === StageStatus.COMPLETED) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (status === StageStatus.FAILED) return <XCircle className="w-4 h-4 text-red-600" />;
    if (status === StageStatus.IN_PROGRESS) return <Clock className="w-4 h-4 text-blue-600" />;
    
    return <Icon className="w-4 h-4 text-gray-400" />;
  };

  const handleStageAction = async (application: ApplicationWithDetails, action: 'approve' | 'reject' | 'review' | 'view_details') => {
    setSelectedApplication(application);
    
    if (action === 'view_details') {
      setShowApplicationDetails(true);
    } else if (action === 'review') {
      if (application.currentStage === 2) {
        setReviewType('written');
        setShowTestReview(true);
      } else if (application.currentStage === 3) {
        setReviewType('video');
        setShowVideoReview(true);
      }
    } else if (action === 'approve') {
      await approveStage(application.id, application.currentStage);
    } else if (action === 'reject') {
      await rejectApplication(application.id);
    }
  };

  const approveStage = async (applicationId: string, currentStage: number) => {
    try {
      await applicationService.progressToNextStage(applicationId, currentStage - 1);
      loadApplications();
    } catch (error) {
      console.error('Error approving stage:', error);
    }
  };

  const rejectApplication = async (applicationId: string) => {
    try {
      await applicationService.updateApplication({
        id: applicationId,
        overallStatus: ApplicationStatus.REJECTED
      });
      loadApplications();
    } catch (error) {
      console.error('Error rejecting application:', error);
    }
  };

  const getStageProgress = (application: ApplicationWithDetails) => {
    const stages = [
      { name: 'Applied', status: application.applicationStatus },
      { name: 'Written Test', status: application.writtenTestStatus },
      { name: 'Video Test', status: application.videoTestStatus },
      { name: 'Interview', status: application.interviewStatus },
    ];

    return (
      <div className="flex items-center space-x-2">
        {stages.map((stage, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
              index + 1 < application.currentStage 
                ? 'bg-green-100 text-green-800'
                : index + 1 === application.currentStage
                ? getStageStatusColor(stage.status)
                : 'bg-gray-100 text-gray-400'
            }`}>
              {index + 1 < application.currentStage ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < stages.length - 1 && (
              <ArrowRight className={`w-4 h-4 ${
                index + 1 < application.currentStage ? 'text-green-400' : 'text-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const getActionButtons = (application: ApplicationWithDetails) => {
    const currentStageStatus = getCurrentStageStatus(application);
    
    if (application.overallStatus === ApplicationStatus.REJECTED || 
        application.overallStatus === ApplicationStatus.HIRED ||
        application.overallStatus === ApplicationStatus.WITHDRAWN) {
      return null;
    }

    return (
      <div className="flex items-center space-x-2">
        {/* View Details Button */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleStageAction(application, 'view_details')}
          className="text-gray-600 hover:text-gray-700"
        >
          <Eye className="w-4 h-4 mr-1" />
          View Details
        </Button>
        
        {/* Review Test Button */}
        {(application.currentStage === 2 && application.writtenTestStatus === StageStatus.COMPLETED) ||
         (application.currentStage === 3 && application.videoTestStatus === StageStatus.COMPLETED) ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStageAction(application, 'review')}
            className="text-blue-600 hover:text-blue-700"
          >
            <Eye className="w-4 h-4 mr-1" />
            Review {application.currentStage === 2 ? 'Test' : 'Video'}
          </Button>
        ) : null}
        
        {/* Approve Stage Button */}
        {currentStageStatus === StageStatus.COMPLETED && (
          <Button
            size="sm"
            onClick={() => handleStageAction(application, 'approve')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <ThumbsUp className="w-4 h-4 mr-1" />
            Approve
          </Button>
        )}
        
        {/* Reject Button */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleStageAction(application, 'reject')}
          className="text-red-600 hover:text-red-700"
        >
          <ThumbsDown className="w-4 h-4 mr-1" />
          Reject
        </Button>
      </div>
    );
  };

  const getCurrentStageStatus = (application: ApplicationWithDetails): StageStatus => {
    switch (application.currentStage) {
      case 1: return application.applicationStatus;
      case 2: return application.writtenTestStatus;
      case 3: return application.videoTestStatus;
      case 4: return application.interviewStatus;
      default: return StageStatus.NOT_STARTED;
    }
  };

  const getStageName = (stage: number): string => {
    const names = ['Application', 'Written Test', 'Video Test', 'Interview'];
    return names[stage - 1] || 'Unknown';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-gray-900">Applications Management</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={loadApplications}
            className="text-blue-600 hover:text-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by candidate name, job title, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | '')}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value={ApplicationStatus.ACTIVE}>Active</option>
          <option value={ApplicationStatus.HIRED}>Hired</option>
          <option value={ApplicationStatus.REJECTED}>Rejected</option>
          <option value={ApplicationStatus.WITHDRAWN}>Withdrawn</option>
        </select>

        {/* Stage Filter */}
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value ? parseInt(e.target.value) : '')}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Stages</option>
          <option value={1}>Application</option>
          <option value={2}>Written Test</option>
          <option value={3}>Video Test</option>
          <option value={4}>Interview</option>
        </select>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No applications found</p>
          </div>
        ) : (
          filteredApplications.map((application) => (
            <div
              key={application.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                {/* Candidate Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{application.candidateName}</h3>
                      <p className="text-sm text-gray-600">{application.candidate?.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">Position:</span> {application.jobTitle}
                    </div>
                    <div>
                      <span className="font-medium">Applied:</span> {new Date(application.appliedAt).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Current Stage:</span> {getStageName(application.currentStage)}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.overallStatus)}`}>
                        {application.overallStatus}
                      </span>
                    </div>
                  </div>

                  {/* Stage Progress */}
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Progress</div>
                    {getStageProgress(application)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="ml-6">
                  {getActionButtons(application)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Written Test Review Modal */}
      {showTestReview && selectedApplication && reviewType === 'written' && (
        <TestReviewModal
          application={selectedApplication}
          isOpen={showTestReview}
          onClose={() => {
            setShowTestReview(false);
            setSelectedApplication(null);
          }}
          onApprove={(feedback) => {
            approveStage(selectedApplication.id, selectedApplication.currentStage);
            setShowTestReview(false);
            setSelectedApplication(null);
          }}
          onReject={(reason) => {
            rejectApplication(selectedApplication.id);
            setShowTestReview(false);
            setSelectedApplication(null);
          }}
        />
      )}

      {/* Video Test Review Modal */}
      {showVideoReview && selectedApplication && reviewType === 'video' && (
        <VideoTestReviewModal
          application={selectedApplication}
          isOpen={showVideoReview}
          onClose={() => {
            setShowVideoReview(false);
            setSelectedApplication(null);
          }}
          onApprove={(feedback, scores) => {
            approveStage(selectedApplication.id, selectedApplication.currentStage);
            setShowVideoReview(false);
            setSelectedApplication(null);
          }}
          onReject={(reason) => {
            rejectApplication(selectedApplication.id);
            setShowVideoReview(false);
            setSelectedApplication(null);
          }}
        />
      )}

      {/* Application Details Modal */}
      {showApplicationDetails && selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          isOpen={showApplicationDetails}
          onClose={() => {
            setShowApplicationDetails(false);
            setSelectedApplication(null);
          }}
        />
      )}
    </div>
  );
}

// Application Details Modal Component
interface ApplicationDetailsModalProps {
  application: ApplicationWithDetails;
  isOpen: boolean;
  onClose: () => void;
}

function ApplicationDetailsModal({ application, isOpen, onClose }: ApplicationDetailsModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCoverLetter = (feedback?: string) => {
    if (!feedback) return null;
    const coverLetterMatch = feedback.match(/Cover Letter: (.*)/);
    return coverLetterMatch ? coverLetterMatch[1] : null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
            <p className="text-gray-600">{application.candidateName} - {application.jobTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Candidate Information */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Candidate Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Name:</span>
                    <p className="text-gray-900">{application.candidateName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Email:</span>
                    <p className="text-gray-900">{application.candidate?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Phone:</span>
                    <p className="text-gray-900">{application.candidate?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Applied Date:</span>
                    <p className="text-gray-900">{formatDate(application.appliedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Application Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Application Status</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Overall Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      application.overallStatus === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                      application.overallStatus === 'HIRED' ? 'bg-green-100 text-green-800' :
                      application.overallStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {application.overallStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Current Stage:</span>
                    <p className="text-gray-900">Stage {application.currentStage} of 4</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Stage Name:</span>
                    <p className="text-gray-900">
                      {application.currentStage === 1 ? 'Application Review' :
                       application.currentStage === 2 ? 'Written Test' :
                       application.currentStage === 3 ? 'Video Test' :
                       application.currentStage === 4 ? 'Interview' : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Information */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Position:</span>
                    <p className="text-gray-900">{application.jobTitle}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Company:</span>
                    <p className="text-gray-900">{application.companyName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Department:</span>
                    <p className="text-gray-900">{application.job?.department || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Location:</span>
                    <p className="text-gray-900">{application.job?.location || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Type:</span>
                    <p className="text-gray-900">{application.job?.type || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Stage Progress */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Progress</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    {[
                      { stage: 1, name: 'Application', status: application.applicationStatus },
                      { stage: 2, name: 'Written Test', status: application.writtenTestStatus },
                      { stage: 3, name: 'Video Test', status: application.videoTestStatus },
                      { stage: 4, name: 'Interview', status: application.interviewStatus }
                    ].map((item) => (
                      <div key={item.stage} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.stage < application.currentStage ? 'bg-green-100 text-green-800' :
                          item.stage === application.currentStage ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-400'
                        }`}>
                          {item.stage < application.currentStage ? 'Completed' :
                           item.stage === application.currentStage ? 'In Progress' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          {getCoverLetter(application.feedback) && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Cover Letter</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{getCoverLetter(application.feedback)}</p>
              </div>
            </div>
          )}

          {/* Internal Notes */}
          {application.internalNotes && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Internal Notes</h3>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{application.internalNotes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}