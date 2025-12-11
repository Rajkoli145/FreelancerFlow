import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Building2, Edit, FileText, Briefcase, DollarSign, FileCheck } from 'lucide-react';
import { getClientById } from '../../api/clientApi';
import { getProjects } from '../../api/projectApi';
import { getInvoices } from '../../api/invoiceApi';
import Button from '../../components/ui/Button';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import ClientStatusBadge from '../../components/clients/ClientStatusBadge';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';

const ClientDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch client details
        const clientResponse = await getClientById(id);
        const clientData = clientResponse.client || clientResponse;
        setClient(clientData);
        
        // Fetch projects for this client
        try {
          const projectsResponse = await getProjects({ clientId: id });
          const projectsData = Array.isArray(projectsResponse) ? projectsResponse : projectsResponse.projects || [];
          setProjects(projectsData);
        } catch (err) {
          console.error('Error fetching projects:', err);
          setProjects([]);
        }
        
        // Fetch invoices for this client
        try {
          const invoicesResponse = await getInvoices({ clientId: id });
          const invoicesData = Array.isArray(invoicesResponse) ? invoicesResponse : invoicesResponse.invoices || [];
          setInvoices(invoicesData);
        } catch (err) {
          console.error('Error fetching invoices:', err);
          setInvoices([]);
        }
      } catch (err) {
        console.error('Error fetching client:', err);
        setError('Unable to load client details');
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [id]);

  const getInitials = (name) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/clients')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Client Details</h1>
            <p className="text-gray-600 mt-1">Loading...</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12">
          <Loader />
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/clients')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Client Details</h1>
            <p className="text-gray-600 mt-1">Error loading client</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Client</h3>
          <p className="text-red-600 mb-4">{error || 'Client not found'}</p>
          <Button onClick={() => navigate('/clients')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  // Calculate stats from real data
  const totalProjects = projects.length;
  const totalInvoices = invoices.length;
  const outstandingAmount = invoices
    .filter(inv => inv.status !== 'paid' && inv.status !== 'Paid')
    .reduce((sum, inv) => sum + (inv.amount || inv.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/clients')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-600 mt-1">Client profile and billing overview</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate(`/clients/${id}/edit`)}
          >
            <Edit className="w-4 h-4" />
            Edit Client
          </Button>
          <Button
            variant="primary"
            className="flex items-center gap-2"
            onClick={() => navigate('/invoices/new')}
          >
            <FileText className="w-4 h-4" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Top Section: Contact Card + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        {/* Contact Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            
            {/* Avatar & Name */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {getInitials(client.name)}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{client.name}</h4>
                {client.company && (
                  <p className="text-sm text-gray-600">{client.company}</p>
                )}
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4 flex-1">
              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
                  <p className="text-sm text-gray-900 mt-0.5">{client.email}</p>
                </div>
              </div>

              {/* Phone */}
              {client.phone && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Phone className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase">Phone</p>
                    <p className="text-sm text-gray-900 mt-0.5">{client.phone}</p>
                  </div>
                </div>
              )}

              {/* Company */}
              {client.company && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Building2 className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase">Company</p>
                    <p className="text-sm text-gray-900 mt-0.5">{client.company}</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {client.notes && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Notes</p>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {client.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row - 3 Columns */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Projects */}
          <div className="h-full flex flex-col justify-between p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{totalProjects}</p>
            </div>
          </div>

          {/* Total Invoices */}
          <div className="h-full flex flex-col justify-between p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
              </div>
              <div className="bg-purple-100 rounded-lg p-3">
                <FileCheck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{totalInvoices}</p>
            </div>
          </div>

          {/* Outstanding Amount */}
          <div className="h-full flex flex-col justify-between p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
              </div>
              <div className="bg-orange-100 rounded-lg p-3">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                ${outstandingAmount.toLocaleString()}
              </p>
              <ClientStatusBadge status={outstandingAmount > 0 ? 'pending' : 'paid'} />
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
        </div>
        <div className="p-6">
          {projects.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No projects yet"
              message="No projects linked to this client yet."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Project Title</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Hours Logged</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount Earned</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project._id || project.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{project.name || project.title}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{project.hoursLogged || 0}h</td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                        ${((project.hoursLogged || 0) * (project.hourlyRate || 0)).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate(`/projects/${project._id || project.id}`)}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invoices Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Invoices</h2>
        </div>
        <div className="p-6">
          {invoices.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No invoices yet"
              message="No invoices generated for this client."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Invoice #</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Created</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice._id || invoice.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                        ${(invoice.amount || invoice.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <ClientStatusBadge status={invoice.status} />
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {invoice.createdDate || new Date(invoice.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate(`/invoices/${invoice._id || invoice.id}`)}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          View Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsPage;
