import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, FileText } from "lucide-react";
import NeuButton from "../../components/ui/NeuButton";
import NeuInput from "../../components/ui/NeuInput";
import { createInvoice } from "../../api/invoiceApi";
import { getClients } from "../../api/clientApi";
import { getProjects } from "../../api/projectApi";
import { getUnbilledTimeLogs } from "../../api/timeApi";
import { useAuth } from '../../context/AuthContext';
import { getCurrencySymbol } from '../../utils/formatCurrency';
import '../../styles/global/neumorphism.css';

const CreateInvoicePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, currencyCode } = useAuth();

  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  
  const [selectedClient, setSelectedClient] = useState(searchParams.get('clientId') || "");
  const [selectedProject, setSelectedProject] = useState(searchParams.get('projectId') || "");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState(currencyCode || 'USD');
  const [taxRate, setTaxRate] = useState(18); // Default 18% GST
  const [discountAmount, setDiscountAmount] = useState(0);
  const [lateFeeRate, setLateFeeRate] = useState(0);
  const [lateFeeType, setLateFeeType] = useState('percentage');
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingUnbilled, setLoadingUnbilled] = useState(false);

  const [lineItems, setLineItems] = useState([
    { id: 1, description: "", quantity: 1, rate: 0 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingClients(true);
        const clientsRes = await getClients();
        const clientList = clientsRes.data || [];
        setClients(clientList);
      } catch (err) {
        console.error('Error fetching clients:', err);
      } finally {
        setLoadingClients(false);
      }

      try {
        setLoadingProjects(true);
        const projectsRes = await getProjects();
        const projectList = projectsRes.data || [];
        setProjects(projectList);
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchData();
  }, []);

  // Filter projects and set currency when client changes
  useEffect(() => {
    if (selectedClient) {
      const filtered = projects.filter(p => p.clientId?._id === selectedClient || p.clientId === selectedClient);
      setFilteredProjects(filtered);
      
      // Reset project if it doesn't belong to selected client
      if (selectedProject) {
        const projectBelongsToClient = filtered.some(p => p._id === selectedProject);
        if (!projectBelongsToClient) {
          setSelectedProject("");
        }
      }
      
      // Auto-fill currency from selected client
      const selectedClientData = clients.find(c => (c._id || c.id) === selectedClient);
      if (selectedClientData && selectedClientData.currency) {
        setCurrency(selectedClientData.currency);
      }
    } else {
      setFilteredProjects([]);
      setSelectedProject("");
      setCurrency('INR'); // Reset to default
    }
  }, [selectedClient, projects, clients]);

  const addLineItem = () => {
    const newItem = {
      id: lineItems.length + 1,
      description: "",
      quantity: 1,
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

  // Generate invoice from unbilled time logs
  const handleGenerateFromUnbilled = async () => {
    if (!selectedProject) {
      setError('Please select a project first');
      return;
    }

    try {
      setLoadingUnbilled(true);
      setError(null);
      
      const response = await getUnbilledTimeLogs(selectedProject);
      const unbilledLogs = response.data || [];
      
      if (unbilledLogs.length === 0) {
        setError('No unbilled time logs found for this project');
        return;
      }

      // Get project hourly rate
      const project = projects.find(p => p._id === selectedProject);
      const rate = project?.hourlyRate || 0;

      // Convert time logs to line items
      const newItems = unbilledLogs.map((log, index) => ({
        id: index + 1,
        description: log.description,
        quantity: log.hours,
        rate: rate,
        timeLogId: log._id
      }));

      setLineItems(newItems);
      
    } catch (err) {
      console.error('Error fetching unbilled time logs:', err);
      setError('Failed to load unbilled time logs');
    } finally {
      setLoadingUnbilled(false);
    }
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => {
      const amount = (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0);
      return sum + amount;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const taxAmount = (subtotal * (parseFloat(taxRate) || 0)) / 100;
  const discount = parseFloat(discountAmount) || 0;
  const total = subtotal + taxAmount - discount;

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
          quantity: parseFloat(item.quantity) || 1,
          rate: parseFloat(item.rate) || 0,
          amount: (parseFloat(item.quantity) || 1) * (parseFloat(item.rate) || 0),
          timeLogId: item.timeLogId || undefined
        })),
        subtotal,
        taxRate: parseFloat(taxRate) || 0,
        discountAmount: parseFloat(discountAmount) || 0,
        lateFeeRate: parseFloat(lateFeeRate) || 0,
        lateFeeType,
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
    <div className="neu-container">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="neu-card">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/invoices")}
              className="neu-button p-2.5 rounded-xl transition-all duration-200"
              style={{ boxShadow: '4px 4px 8px #c9ced6, -4px -4px 8px #ffffff' }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
                e.currentTarget.style.boxShadow = 'inset 3px 3px 6px #c9ced6, inset -3px -3px 6px #ffffff';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '4px 4px 8px #c9ced6, -4px -4px 8px #ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '4px 4px 8px #c9ced6, -4px -4px 8px #ffffff';
              }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: '#6b7280' }} />
            </button>
            <div>
              <h1 className="text-3xl font-bold neu-heading">Create Invoice</h1>
              <p className="neu-text-light mt-1">Create a new invoice for your client</p>
            </div>
          </div>
        </div>

        {/* Invoice Details Card */}
        <div className="neu-card space-y-6">
          {error && (
            <div className="neu-card-inset p-4" style={{ borderLeft: '4px solid #ef4444' }}>
              <p className="text-sm" style={{ color: '#991b1b' }}>{error}</p>
            </div>
          )}

          <h2 className="text-lg font-semibold neu-heading pb-3" style={{ borderBottom: '1px solid var(--neu-dark)' }}>
            Invoice Details
          </h2>
          
          {/* Client and Project Selection */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium neu-text mb-2">
                Select Client *
              </label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                disabled={loadingClients || loading}
                className="neu-input w-full"
              >
                <option value="">{loadingClients ? 'Loading...' : 'Choose a client'}</option>
                {clients.map((client) => (
                  <option key={client._id || client.id} value={client._id || client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium neu-text mb-2">
                Select Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                disabled={loadingProjects || loading || !selectedClient}
                className="neu-input w-full"
              >
                <option value="">{loadingProjects ? 'Loading...' : 'Choose a project (optional)'}</option>
                {filteredProjects.map((project) => (
                  <option key={project._id || project.id} value={project._id || project.id}>
                    {project.title || project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Issue Date, Due Date, and Currency */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium neu-text mb-2">
                Issue Date *
              </label>
              <NeuInput
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium neu-text mb-2">
                Due Date *
              </label>
              <NeuInput
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium neu-text mb-2">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={loading}
                className="neu-input w-full"
                style={{
                  backgroundColor: '#eef1f6',
                  boxShadow: 'inset 3px 3px 6px #c9ced6, inset -3px -3px 6px #ffffff',
                  border: 'none',
                  outline: 'none',
                  color: '#374151',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px'
                }}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          {/* Late Fee Settings */}
          <div>
            <label className="block text-sm font-medium neu-text mb-2">
              Late Fee Settings (Optional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs neu-text-light mb-1">Fee Rate</label>
                <NeuInput
                  type="number"
                  value={lateFeeRate}
                  onChange={(e) => setLateFeeRate(e.target.value)}
                  placeholder="0"
                  step="0.01"
                  min="0"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs neu-text-light mb-1">Fee Type</label>
                <select
                  value={lateFeeType}
                  onChange={(e) => setLateFeeType(e.target.value)}
                  disabled={loading}
                  className="neu-input w-full"
                >
                  <option value="percentage">Percentage per day</option>
                  <option value="fixed">Fixed amount per day</option>
                </select>
              </div>
            </div>
            <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>
              {lateFeeType === 'percentage' 
                ? 'Daily percentage of invoice total after due date' 
                : 'Fixed daily charge after due date'}
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium neu-text mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or payment terms..."
              rows={3}
              disabled={loading}
              className="neu-input w-full resize-none"
              style={{
                backgroundColor: '#eef1f6',
                boxShadow: 'inset 3px 3px 6px #c9ced6, inset -3px -3px 6px #ffffff',
                border: 'none',
                outline: 'none',
                color: '#374151'
              }}
            />
          </div>
        </div>

        {/* Line Items Card */}
        <div className="neu-card space-y-6">
          <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--neu-dark)' }}>
            <h2 className="text-lg font-semibold neu-heading">
              Line Items
            </h2>
            
            {/* Generate from Unbilled Hours Button */}
            {selectedProject && (
              <NeuButton
                variant="default"
                onClick={handleGenerateFromUnbilled}
                disabled={loading || loadingUnbilled}
                className="flex items-center gap-2 text-sm"
              >
                <FileText className="w-4 h-4" />
                {loadingUnbilled ? 'Loading...' : 'Generate from Unbilled Hours'}
              </NeuButton>
            )}
          </div>

          <div className="neu-card-inset rounded-xl overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-semibold neu-text" style={{ 
                borderBottom: '1px solid var(--neu-dark)',
                backgroundColor: 'rgba(201, 206, 214, 0.1)'
              }}>
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-right">Quantity/Hours</div>
                <div className="col-span-2 text-right">Rate</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-1"></div>
              </div>

              {/* Line Items Rows */}
              {lineItems.map((item, index) => {
                const amount = (parseFloat(item.quantity) || parseFloat(item.hours) || 0) * (parseFloat(item.rate) || 0);

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-4 px-4 py-3 items-center"
                    style={{ 
                      borderBottom: index === lineItems.length - 1 ? 'none' : '1px solid rgba(201, 206, 214, 0.2)'
                    }}
                  >
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(item.id, "description", e.target.value)
                        }
                        placeholder="e.g., UI Design"
                        className="neu-input w-full text-sm"
                      />
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.quantity || item.hours}
                        onChange={(e) =>
                          updateLineItem(item.id, "quantity", e.target.value)
                        }
                        placeholder="0"
                        min="0"
                        step="0.5"
                        className="neu-input w-full text-sm text-right"
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
                        className="neu-input w-full text-sm text-right"
                      />
                    </div>

                    <div className="col-span-2 text-right font-medium neu-text">
                      {getCurrencySymbol(currency)}{amount.toLocaleString()}
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => removeLineItem(item.id)}
                        className="p-1.5 rounded-lg transition-all duration-200"
                        style={{ 
                          color: lineItems.length === 1 ? '#9ca3af' : '#ef4444',
                          boxShadow: '3px 3px 6px #c9ced6, -3px -3px 6px #ffffff'
                        }}
                        disabled={lineItems.length === 1}
                        onMouseDown={(e) => {
                          if (lineItems.length > 1) {
                            e.currentTarget.style.transform = 'scale(0.95)';
                            e.currentTarget.style.boxShadow = 'inset 2px 2px 4px #c9ced6, inset -2px -2px 4px #ffffff';
                          }
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '3px 3px 6px #c9ced6, -3px -3px 6px #ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '3px 3px 6px #c9ced6, -3px -3px 6px #ffffff';
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Line Item Button */}
            <NeuButton
              variant="default"
              onClick={addLineItem}
              className="flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Line Item
            </NeuButton>
        </div>

        {/* Total Summary Card */}
        <div className="neu-card">
          <h3 className="text-sm font-semibold neu-text mb-4">Invoice Summary</h3>
          
          {/* Tax and Discount Inputs */}
          <div className="grid grid-cols-2 gap-6 mb-6 pb-6" style={{ borderBottom: '1px solid var(--neu-dark)' }}>
            <div>
              <label className="block text-sm font-medium neu-text mb-2">
                Tax Rate (%)
              </label>
              <NeuInput
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="0"
                min="0"
                max="100"
                step="0.1"
              />
              <p className="text-xs neu-text-light mt-1">Default is 18% (GST)</p>
            </div>

            <div>
              <label className="block text-sm font-medium neu-text mb-2">
                Discount Amount ($)
              </label>
              <NeuInput
                type="number"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
              <p className="text-xs neu-text-light mt-1">Fixed amount discount</p>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between neu-text">
              <span className="font-medium">Subtotal</span>
              <span className="font-semibold">{getCurrencySymbol(currency)}{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between neu-text">
              <span className="font-medium">Tax ({taxRate}%)</span>
              <span className="font-semibold">{getCurrencySymbol(currency)}{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="font-medium">Discount</span>
                <span className="font-semibold">-{getCurrencySymbol(currency)}{parseFloat(discountAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="pt-3" style={{ borderTop: '1px solid var(--neu-dark)' }}>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold neu-heading">
                  Total Amount
                </span>
                <span className="text-3xl font-bold" style={{ color: '#4A5FFF' }}>
                  {getCurrencySymbol(currency)}{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <NeuButton
            variant="default"
            onClick={() => navigate("/invoices")}
            disabled={loading}
          >
            Cancel
          </NeuButton>

          <NeuButton
            variant="primary"
            onClick={handleSaveInvoice}
            disabled={loading || loadingClients || loadingProjects}
          >
            {loading ? 'Creating...' : 'Create Invoice'}
          </NeuButton>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoicePage;
