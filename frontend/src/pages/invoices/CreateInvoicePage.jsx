import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { createInvoice } from "../../api/invoiceApi";
import { getClients } from "../../api/clientApi";
import { getProjects } from "../../api/projectApi";

const CreateInvoicePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  
  const [selectedClient, setSelectedClient] = useState(searchParams.get('clientId') || "");
  const [selectedProject, setSelectedProject] = useState(searchParams.get('projectId') || "");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [lineItems, setLineItems] = useState([
    { id: 1, description: "", hours: 0, rate: 0 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingClients(true);
        const clientsRes = await getClients();
        const clientList = Array.isArray(clientsRes) ? clientsRes : clientsRes.clients || [];
        setClients(clientList);
      } catch (err) {
        console.error('Error fetching clients:', err);
      } finally {
        setLoadingClients(false);
      }

      try {
        setLoadingProjects(true);
        const projectsRes = await getProjects();
        const projectList = Array.isArray(projectsRes) ? projectsRes : projectsRes.projects || [];
        setProjects(projectList);
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchData();
  }, []);

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

  const handleSaveInvoice = async () => {
    // Validation
    if (!selectedClient) {
      setError('Please select a client');
      return;
    }
    if (!issueDate || !dueDate) {
      setError('Please provide issue date and due date');
      return;
    }
    if (lineItems.length === 0 || lineItems.every(item => !item.description)) {
      setError('Please add at least one line item');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const invoiceData = {
        clientId: selectedClient,
        projectId: selectedProject || undefined,
        issueDate,
        dueDate,
        items: lineItems.filter(item => item.description).map(item => ({
          description: item.description,
          hours: parseFloat(item.hours) || 0,
          rate: parseFloat(item.rate) || 0,
          amount: (parseFloat(item.hours) || 0) * (parseFloat(item.rate) || 0)
        })),
        totalAmount: total,
        amount: total,
        status: 'unpaid',
        notes: notes || undefined
      };

      await createInvoice(invoiceData);
      navigate("/invoices");
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError(err.error || err.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7FB]">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Header Section */}
        <div>
          <button
            onClick={() => navigate("/invoices")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Invoices</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
          <p className="text-gray-500 mt-1">
            Create a new invoice for your client
          </p>
        </div>

        {/* Invoice Details Card */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

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
                placeholder="Choose a client"
                disabled={loadingClients || loading}
              >
                <option value="">{loadingClients ? 'Loading...' : 'Choose a client'}</option>
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
                placeholder="Choose a project"
                disabled={loadingProjects || loading}
              >
                <option value="">{loadingProjects ? 'Loading...' : 'Choose a project (optional)'}</option>
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
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:opacity-50"
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
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:opacity-50"
              />
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
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none disabled:opacity-50"
            />
          </div>
        </div>

        {/* Line Items Card */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3">
            Line Items
          </h2>

          <div className="border border-gray-200 rounded-lg overflow-hidden">\n              {/* Table Header */}
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

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            onClick={() => navigate("/invoices")}
            disabled={loading}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <Button
            variant="primary"
            onClick={handleSaveInvoice}
            disabled={loading || loadingClients || loadingProjects}
            className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoicePage;
