import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { casesApi } from '../api/client';
import { AlertCircle, ArrowRight } from 'lucide-react';

function NewCase() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    case_type: '',
    severity: '',
    evidence_strength: '',
    impact_type: '',
    subject: '',
    description: ''
  });

  const calculateTone = () => {
    const { case_type, severity, evidence_strength } = formData;
    if ((case_type === 'Employee Fraud' || case_type === 'Vendor Fraud') && severity === 'High' && evidence_strength === 'Documentary') {
      return 'Very Strict';
    } else if ((case_type === 'Employee Fraud' || case_type === 'Vendor Fraud') && severity === 'Medium') {
      return 'Strict';
    } else if (case_type === 'Employee Misconduct' && (evidence_strength === 'Both' || evidence_strength === 'Documentary')) {
      return 'Balanced';
    }
    return 'Cautious / Advisory';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await casesApi.create(formData);
      navigate(`/case/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create case');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const predictedTone = formData.case_type && formData.severity && formData.evidence_strength
    ? calculateTone()
    : null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Case</h1>
        <p className="text-gray-600 mt-1">Start a new investigation case</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Case Type *</label>
            <select
              name="case_type"
              value={formData.case_type}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select type...</option>
              <option value="Employee Fraud">Employee Fraud</option>
              <option value="Vendor Fraud">Vendor Fraud</option>
              <option value="Employee Misconduct">Employee Misconduct</option>
              <option value="Policy Violation">Policy Violation</option>
              <option value="Conflict of Interest">Conflict of Interest</option>
              <option value="Data Breach">Data Breach</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity *</label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select severity...</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Evidence Strength *</label>
            <select
              name="evidence_strength"
              value={formData.evidence_strength}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select evidence type...</option>
              <option value="Documentary">Documentary (emails, documents, logs)</option>
              <option value="Testimonial">Testimonial (interviews, statements)</option>
              <option value="Both">Both Documentary and Testimonial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Impact Type *</label>
            <select
              name="impact_type"
              value={formData.impact_type}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select impact...</option>
              <option value="Financial">Financial</option>
              <option value="Reputational">Reputational</option>
              <option value="Operational">Operational</option>
              <option value="Legal/Regulatory">Legal/Regulatory</option>
              <option value="Multiple">Multiple</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            placeholder="Brief description of the subject under investigation"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Detailed description of the case background and allegations..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {predictedTone && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Predicted Report Tone:</span> {predictedTone}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              The tone is automatically calculated based on case type, severity, and evidence strength.
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Case'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewCase;
