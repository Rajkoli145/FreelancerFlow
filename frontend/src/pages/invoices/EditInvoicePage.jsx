import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Loader from "../../components/ui/Loader";
import { getInvoiceById, updateInvoice } from "../../api/invoiceApi";
import { getClients } from "../../api/clientApi";
import { getProjects } from "../../api/projectApi";

const EditInvoicePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    const styles = {
      paid: "bg-green-100 text-green-700 border-green-200",
      unpaid: "bg-yellow-100 text-yellow-700 border-yellow-200",
      overdue: "bg-red-100 text-red-700 border-red-200",
    };

    const labels = {
      paid: "Paid",
      unpaid: "Unpaid",
      overdue: "Overdue",
    };

    return (
      <span
        className={`px-4 py-2 rounded-full text-sm font-semibold border ${
          styles[status] || styles.unpaid
        }`}
      >
        {labels[status]}
      </span>
    );
  };

  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("unpaid");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch invoice, clients, and projects in parallel
        const [invoiceRes, clientsRes, projectsRes] = await Promise.all([
          getInvoiceById(id),
          getClients(),
          getProjects()
        ]);
        
        const invoice = invoiceRes.invoice || invoiceRes;
        const clientsData = Array.isArray(clientsRes) ? clientsRes : clientsRes.clients || [];
        const projectsData = Array.isArray(projectsRes) ? projectsRes : projectsRes.projects || [];
        
        setClients(clientsData);
        setProjects(projectsData);
        setLoadingClients(false);
        setLoadingProjects(false);
        
        // Pre-fill form
        setSelectedClient(invoice.clientId?._id || invoice.clientId || '');
        setSelectedProject(invoice.projectId?._id || invoice.projectId || '');
        setIssueDate(invoice.issueDate ? new Date(invoice.issueDate).toISOString().split('T')[0] : '');
        setDueDate(invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '');
        setPaymentStatus(invoice.status || 'unpaid');
        setNotes(invoice.notes || '');
        setLineItems(invoice.items && invoice.items.length > 0 
          ? invoice.items.map((item, idx) => ({
              id: idx + 1,
              description: item.description || '',
              hours: item.hours || 0,
              rate: item.rate || 0
            }))
          : [{ id: 1, description: '', hours: 0, rate: 0 }]
        );
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError(err.message || 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const addLineItem = () => {
    const newItem = {
      id: lineItems.length + 1,
      description: "",
      hours: 0,
      rate: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (id, field, value) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => {
      const amount = (parseFloat(item.hours) || 0) * (parseFloat(item.rate) || 0);
      return sum + amount;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const tax = 0;
  const total = subtotal + tax;

  const handleSaveChanges = async () => {
    // Validation
    if (!selectedClient) {
      setError('Please select a client');
      return;
    }
    if (!issueDate || !dueDate) {
      setError('Please provide both issue date and due date');
      return;
    }
    const validItems = lineItems.filter(item => item.description.trim());
    if (validItems.length === 0) {
      setError('Please add at least one line item with a description');
      return;
    }
    
    try {
      setUpdating(true);
      setError(null);
      
      const invoiceData = {
        clientId: selectedClient,
        projectId: selectedProject || undefined,
        issueDate,
        dueDate,
        items: validItems.map(item => ({
          description: item.description,
          hours: parseFloat(item.hours) || 0,
          rate: parseFloat(item.rate) || 0,
          amount: (parseFloat(item.hours) || 0) * (parseFloat(item.rate) || 0)
        })),
        totalAmount: total,
        amount: total,
        status: paymentStatus,
        notes: notes.trim()
      };
      
      await updateInvoice(id, invoiceData);
      navigate(`/invoices/${id}`);
    } catch (err) {
      console.error('Error updating invoice:', err);
      setError(err.message || 'Failed to update invoice');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    navigate(`/invoices/${id}`);
  };

  const handleDeleteInvoice = () => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      console.log("Delete Invoice clicked");
      navigate("/invoices");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (error && !selectedClient) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Invoice</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/invoices')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7FB]">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        {/* Header Section */}
        <div>
          <button
            onClick={() => navigate(`/invoices/${id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Invoices</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Invoice</h1>
              <p className="text-gray-500 mt-1">
                Update invoice details, line items, and payment status.
              </p>
            </div>

            {/* Payment Status Badge */}
            <StatusBadge status={paymentStatus} />
          </div>
        </div>

        {/* Invoice Details Card */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3">
            Invoice Details
          </h2>

          {/* Client and Project Selection */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Client *
              </label>
              <Select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                disabled={loadingClients || updating}
              >
                <option value="">{loadingClients ? 'Loading...' : 'Select a client'}</option>
                {clients.map((client) => (
                  <option key={client._id || client.id} value={client._id || client.id}>
                    {client.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Project
              </label>
              <Select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                disabled={loadingProjects || updating}
              >
                <option value="">No project</option>
                {projects.map((project) => (
                  <option key={project._id || project.id} value={project._id || project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Issue Date and Due Date */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Date *
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-gray-100 disabled:opacity-50"
                disabled={updating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-gray-100 disabled:opacity-50"
                disabled={updating}
              />
            </div>
          </div>

          {/* Payment Status */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status *
              </label>
              <Select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                disabled={updating}
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or payment terms..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none disabled:bg-gray-100 disabled:opacity-50"
              disabled={updating}
            />
          </div>
        </div>

        {/* Line Items Card */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3">
            Line Items
          </h2>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 grid grid-cols-12 gap-4 px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
              <div className="col-span-5">Description</div>
              <div className="col-span-2 text-right">Hours</div>
              <div className="col-span-2 text-right">Rate</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-1"></div>
            </div>

            {/* Line Items Rows */}
            {lineItems.map((item) => {
              const amount = (parseFloat(item.hours) || 0) * (parseFloat(item.rate) || 0);

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 last:border-0 items-center"
                >
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(item.id, "description", e.target.value)
                      }
                      placeholder="e.g., UI Design"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.hours}
                      onChange={(e) =>
                        updateLineItem(item.id, "hours", e.target.value)
                      }
                      placeholder="0"
                      min="0"
                      step="0.5"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) =>
                        updateLineItem(item.id, "rate", e.target.value)
                      }
                      placeholder="0"
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="col-span-2 text-right font-medium text-gray-900">
                    ${amount.toLocaleString()}
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => removeLineItem(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      disabled={lineItems.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Line Item Button */}
          <button
            onClick={addLineItem}
            className="mt-3 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Line Item
          </button>
        </div>

        {/* Total Summary Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Invoice Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-700">
              <span className="font-medium">Subtotal</span>
              <span className="font-semibold">${subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span className="font-medium">Tax (0%)</span>
              <span className="font-semibold">${tax.toLocaleString()}</span>
            </div>

            <div className="pt-3 border-t border-gray-300">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">
                  Total Amount
                </span>
                <span className="text-3xl font-bold text-indigo-600">
                  ${total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleDeleteInvoice}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={updating}
          >
            Delete Invoice
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={updating}
            >
              Cancel
            </button>

            <Button
              variant="primary"
              onClick={handleSaveChanges}
              className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm"
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditInvoicePage;
