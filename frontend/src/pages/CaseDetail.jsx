import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  casesApi,
  evidenceApi,
  interviewsApi,
  findingsApi,
  reportsApi
} from '../api/client';
import {
  ArrowLeft,
  FileText,
  Users,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  Wand2,
  Download,
  X
} from 'lucide-react';

function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [findings, setFindings] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, [id]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [caseRes, evidenceRes, interviewsRes, findingsRes, reportsRes] = await Promise.all([
        casesApi.get(id),
        evidenceApi.list(id),
        interviewsApi.list(id),
        findingsApi.list(id),
        reportsApi.list(id)
      ]);
      setCaseData(caseRes.data);
      setEvidence(evidenceRes.data);
      setInterviews(interviewsRes.data);
      setFindings(findingsRes.data);
      setReports(reportsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      await reportsApi.generate(id);
      await fetchAllData();
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report: ' + (error.response?.data?.detail || error.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleAddEvidence = async (data) => {
    try {
      await evidenceApi.create(id, data);
      const res = await evidenceApi.list(id);
      setEvidence(res.data);
      setShowModal(null);
    } catch (error) {
      alert('Failed to add evidence');
    }
  };

  const handleAddInterview = async (data) => {
    try {
      await interviewsApi.create(id, data);
      const res = await interviewsApi.list(id);
      setInterviews(res.data);
      setShowModal(null);
    } catch (error) {
      alert('Failed to add interview');
    }
  };

  const handleAddFinding = async (data) => {
    try {
      await findingsApi.create(id, data);
      const res = await findingsApi.list(id);
      setFindings(res.data);
      setShowModal(null);
    } catch (error) {
      alert('Failed to add finding');
    }
  };

  const handleDeleteEvidence = async (evidenceId) => {
    if (!confirm('Delete this evidence?')) return;
    try {
      await evidenceApi.delete(id, evidenceId);
      setEvidence(evidence.filter(e => e.id !== evidenceId));
    } catch (error) {
      alert('Failed to delete evidence');
    }
  };

  const handleDeleteInterview = async (interviewId) => {
    if (!confirm('Delete this interview?')) return;
    try {
      await interviewsApi.delete(id, interviewId);
      setInterviews(interviews.filter(i => i.id !== interviewId));
    } catch (error) {
      alert('Failed to delete interview');
    }
  };

  const handleDeleteFinding = async (findingId) => {
    if (!confirm('Delete this finding?')) return;
    try {
      await findingsApi.delete(id, findingId);
      setFindings(findings.filter(f => f.id !== findingId));
    } catch (error) {
      alert('Failed to delete finding');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading case details...</div>;
  }

  if (!caseData) {
    return <div className="p-8 text-center text-gray-500">Case not found</div>;
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'evidence', label: `Evidence (${evidence.length})` },
    { id: 'interviews', label: `Interviews (${interviews.length})` },
    { id: 'findings', label: `Findings (${findings.length})` },
    { id: 'reports', label: `Reports (${reports.length})` }
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{caseData.case_number}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                caseData.severity === 'High' ? 'bg-red-100 text-red-700' :
                caseData.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {caseData.severity}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                caseData.status === 'Completed' ? 'bg-green-100 text-green-700' :
                caseData.status === 'Draft Ready' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {caseData.status}
              </span>
            </div>
            <p className="text-xl text-gray-600 mt-2">{caseData.subject}</p>
            <p className="text-sm text-gray-500 mt-1">
              {caseData.case_type} | Tone: {caseData.tone}
            </p>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Wand2 className="w-5 h-5" />
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{caseData.description || 'No description provided.'}</p>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Evidence Strength</p>
                <p className="text-lg font-medium text-gray-900">{caseData.evidence_strength}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Impact Type</p>
                <p className="text-lg font-medium text-gray-900">{caseData.impact_type}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Report Tone</p>
                <p className="text-lg font-medium text-gray-900">{caseData.tone}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'evidence' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Evidence Items</h3>
              <button
                onClick={() => setShowModal('evidence')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Evidence
              </button>
            </div>
            {evidence.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No evidence added yet.</p>
            ) : (
              <div className="space-y-3">
                {evidence.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileText className="w-8 h-8 text-blue-500" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{item.evidence_id}</span>
                          <span className="text-gray-600">- {item.file_name}</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {item.evidence_type} | Source: {item.source || 'N/A'}
                        </p>
                        {item.relevance && (
                          <p className="text-sm text-gray-600 mt-1">{item.relevance}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteEvidence(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'interviews' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Interview Records</h3>
              <button
                onClick={() => setShowModal('interview')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Interview
              </button>
            </div>
            {interviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No interviews recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {interviews.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Users className="w-8 h-8 text-green-500" />
                      <div>
                        <p className="font-medium text-gray-900">{item.interviewee_name}</p>
                        <p className="text-sm text-gray-500">
                          {item.role} | {item.mode || 'Mode not specified'}
                        </p>
                        {item.summary && (
                          <p className="text-sm text-gray-600 mt-1">{item.summary}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteInterview(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'findings' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Key Findings</h3>
              <button
                onClick={() => setShowModal('finding')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Finding
              </button>
            </div>
            {findings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No findings documented yet.</p>
            ) : (
              <div className="space-y-3">
                {findings.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <AlertTriangle className="w-8 h-8 text-yellow-500" />
                      <div>
                        <p className="font-medium text-gray-900">{item.finding_id}: {item.description}</p>
                        <p className="text-sm text-gray-500">
                          Evidence: {item.evidence_ids?.join(', ') || 'None linked'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteFinding(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Reports</h3>
            {reports.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reports generated yet. Click "Generate Report" to create one.</p>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileText className="w-8 h-8 text-purple-500" />
                      <div>
                        <p className="font-medium text-gray-900">Version {report.version}</p>
                        <p className="text-sm text-gray-500">
                          Status: {report.status} | Generated: {new Date(report.generated_at).toLocaleString()}
                        </p>
                        {report.content && (
                          <p className="text-sm text-gray-600 mt-1">
                            Tone: {report.content.tone_applied} |
                            Evidence: {report.content.evidence_count} |
                            Interviews: {report.content.interview_count}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {report.status === 'Draft' && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">Draft</span>
                      )}
                      {report.status === 'Final' && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Final
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          type={showModal}
          onClose={() => setShowModal(null)}
          onSubmit={
            showModal === 'evidence' ? handleAddEvidence :
            showModal === 'interview' ? handleAddInterview :
            handleAddFinding
          }
          evidenceIds={evidence.map(e => e.evidence_id)}
        />
      )}
    </div>
  );
}

function Modal({ type, onClose, onSubmit, evidenceIds }) {
  const [formData, setFormData] = useState(
    type === 'evidence' ? { file_name: '', evidence_type: '', source: '', relevance: '' } :
    type === 'interview' ? { interviewee_name: '', role: '', mode: '', summary: '' } :
    { description: '', evidence_ids: [] }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEvidenceIds = (e) => {
    const value = e.target.value;
    const ids = value.split(',').map(s => s.trim()).filter(Boolean);
    setFormData({ ...formData, evidence_ids: ids });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Add {type === 'evidence' ? 'Evidence' : type === 'interview' ? 'Interview' : 'Finding'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'evidence' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File Name *</label>
                <input
                  type="text"
                  name="file_name"
                  required
                  value={formData.file_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., email_chain_jan2024.pdf"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="evidence_type"
                  value={formData.evidence_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select type...</option>
                  <option value="Document">Document</option>
                  <option value="Email">Email</option>
                  <option value="Financial Record">Financial Record</option>
                  <option value="System Log">System Log</option>
                  <option value="Photo/Video">Photo/Video</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., HR Department"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relevance</label>
                <textarea
                  name="relevance"
                  value={formData.relevance}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="How is this evidence relevant to the case?"
                />
              </div>
            </>
          )}

          {type === 'interview' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interviewee Name *</label>
                <input
                  type="text"
                  name="interviewee_name"
                  required
                  value={formData.interviewee_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Finance Manager"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                <select
                  name="mode"
                  value={formData.mode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select mode...</option>
                  <option value="In-Person">In-Person</option>
                  <option value="Video Call">Video Call</option>
                  <option value="Phone">Phone</option>
                  <option value="Written Statement">Written Statement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Key points from the interview..."
                />
              </div>
            </>
          )}

          {type === 'finding' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the finding..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Evidence IDs *</label>
                <input
                  type="text"
                  required
                  onChange={handleEvidenceIds}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., E1, E2, E3"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: {evidenceIds.length > 0 ? evidenceIds.join(', ') : 'No evidence added yet'}
                </p>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CaseDetail;
