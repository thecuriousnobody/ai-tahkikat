import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { casesApi } from '../api/client';
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle,
  ChevronRight,
  Filter
} from 'lucide-react';

function Dashboard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    case_type: ''
  });

  useEffect(() => {
    fetchCases();
  }, [filters]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const response = await casesApi.list(activeFilters);
      setCases(response.data);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'In Progress': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'Draft Ready': return <FileText className="w-5 h-5 text-yellow-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const stats = {
    total: cases.length,
    inProgress: cases.filter(c => c.status === 'In Progress').length,
    completed: cases.filter(c => c.status === 'Completed').length,
    highSeverity: cases.filter(c => c.severity === 'High').length
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of all investigation cases</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Cases</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <Clock className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">High Severity</p>
              <p className="text-3xl font-bold text-red-600">{stats.highSeverity}</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="In Progress">In Progress</option>
            <option value="Draft Ready">Draft Ready</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Severity</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            value={filters.case_type}
            onChange={(e) => setFilters({ ...filters, case_type: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="Employee Fraud">Employee Fraud</option>
            <option value="Vendor Fraud">Vendor Fraud</option>
            <option value="Employee Misconduct">Employee Misconduct</option>
            <option value="Policy Violation">Policy Violation</option>
          </select>
        </div>
      </div>

      {/* Cases List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Cases</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading cases...</div>
        ) : cases.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No cases found. <Link to="/new-case" className="text-blue-600 hover:underline">Create your first case</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {cases.map((caseItem) => (
              <Link
                key={caseItem.id}
                to={`/case/${caseItem.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(caseItem.status)}
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{caseItem.case_number}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(caseItem.severity)}`}>
                        {caseItem.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{caseItem.subject}</p>
                    <p className="text-xs text-gray-400 mt-1">{caseItem.case_type} | Tone: {caseItem.tone}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
