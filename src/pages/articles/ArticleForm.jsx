import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { ArrowRight, Plus, Trash2, Check, Upload, X, Hash, ArrowLeft } from 'lucide-react';
import { articlesAPI } from '../../services/api';
import { useConfig } from '../../context/ConfigContext';
import { Button, Input, PageHeader, Select, Textarea } from '../../components/ui';

// Simplest Quantity Input - Two Inputs Auto-Sync
const QuantityInput = ({ label, value, onChange, onEnter }) => {
  const [piecesInput, setPiecesInput] = useState('');
  const [dozenInput, setDozenInput] = useState('');
  const [lastEdited, setLastEdited] = useState('pieces');

  // Update inputs when value prop changes (from parent or initial load)
  useEffect(() => {
    const totalPieces = parseInt(value) || 0;
    if (totalPieces > 0 && lastEdited === 'pieces') {
      setPiecesInput(totalPieces.toString());
      setDozenInput((totalPieces / 12).toFixed(2));
    }
  }, [value, lastEdited]);

  const handlePiecesChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^\d+$/.test(val)) {
      setPiecesInput(val);
      setLastEdited('pieces');
      const pieces = parseInt(val) || 0;
      setDozenInput(pieces ? (pieces / 12).toFixed(2) : '');
      onChange({ target: { value: val } });
    }
  };

  const handleDozenChange = (e) => {
    const val = e.target.value;
    // Allow empty, numbers, and decimal point
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setDozenInput(val);
      setLastEdited('dozen');
      
      // Only calculate pieces if we have a valid number
      if (val && !val.endsWith('.')) {
        const dozen = parseFloat(val);
        if (!isNaN(dozen)) {
          const pieces = Math.round(dozen * 12);
          setPiecesInput(pieces.toString());
          onChange({ target: { value: pieces.toString() } });
        }
      } else if (val === '') {
        setPiecesInput('');
        onChange({ target: { value: '0' } });
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnter?.();
    }
  };

  return (
    <div className="">
      {label && (
        <label className="block text-[14px] font-semibold text-slate-700 mb-1 ml-1">
          {label}
        </label>
      )}
      
      <div className="grid grid-cols-2 gap-3">
        {/* Pieces Input */}
        <div>
          <Input
            type="text"
            value={piecesInput}
            onChange={handlePiecesChange}
            onKeyDown={handleKeyDown}
            placeholder="Pices"
          />
        </div>

        {/* Dozen Input */}
        <div>
          <Input
            type="text"
            value={dozenInput}
            onChange={handleDozenChange}
            onKeyDown={handleKeyDown}
            placeholder="Dorzen"
          />
        </div>
      </div>
    </div>
  );
};

// Smart Calculator Input Component
const CalculatorInput = ({ label, value, onChange, placeholder, onEnter }) => {
  const [displayValue, setDisplayValue] = useState(value || '');
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationHistory, setCalculationHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setDisplayValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;
    setDisplayValue(val);
    
    // Check if user pressed '=' to calculate
    if (val.includes('=')) {
      const expression = val.split('=')[0].trim();
      try {
        setIsCalculating(true);
        // Safe evaluation - only allow numbers and basic operators
        const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, '');
        const result = Function(`'use strict'; return (${sanitized})`)();
        
        if (!isNaN(result) && isFinite(result)) {
          const rounded = Math.round(result * 100) / 100;
          
          // Add to history
          setCalculationHistory(prev => [...prev, {
            expression: expression,
            result: rounded,
            timestamp: new Date().toLocaleTimeString()
          }]);
          
          setDisplayValue(rounded.toString());
          onChange(rounded.toString());
        }
      } catch (err) {
        toast.error('Invalid calculation');
      } finally {
        setIsCalculating(false);
      }
    } else {
      onChange(val);
    }
  };

  const handleKeyDown = (e) => {
    // F2 to show/hide calculation history
    if (e.key === 'F2') {
      e.preventDefault();
      setShowHistory(!showHistory);
      return;
    }
    
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // If there's a calculation to perform (no = sign yet)
      if (displayValue && !displayValue.includes('=')) {
        const expression = displayValue.trim();
        try {
          setIsCalculating(true);
          // Safe evaluation - only allow numbers and basic operators
          const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, '');
          
          // If it's just a number, move to next field
          if (/^\d+\.?\d*$/.test(sanitized)) {
            if (onEnter) onEnter();
            return;
          }
          
          const result = Function(`'use strict'; return (${sanitized})`)();
          
          if (!isNaN(result) && isFinite(result)) {
            const rounded = Math.round(result * 100) / 100;
            
            // Add to history
            setCalculationHistory(prev => [...prev, {
              expression: expression,
              result: rounded,
              timestamp: new Date().toLocaleTimeString()
            }]);
            
            setDisplayValue(rounded.toString());
            onChange(rounded.toString());
          }
        } catch (err) {
          // If calculation fails, just move to next field
          if (onEnter) onEnter();
        } finally {
          setIsCalculating(false);
        }
      } else {
        // If already calculated or just a number, move to next field
        if (onEnter) onEnter();
      }
    }
  };

  return (
    <div className="flex flex-col gap-1.5 relative">
      {label && (
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      {/* <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Enter value or calculation (e.g., 59*4/36 then Enter)"}
        className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 font-mono ${
          isCalculating 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-slate-300 bg-white hover:border-slate-400 focus:border-slate-900 focus:outline-none'
        }`}
      /> */}
      <Input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Enter value or calculation (e.g., 59*4/36 then Enter)"}
        className={isCalculating 
            ? 'border-blue-400 bg-blue-50' 
            : ''
        }
      />

      {/* Calculation History Dropdown */}
      <AnimatePresence>
        {showHistory && calculationHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-300 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto"
          >
            <div className="p-3 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Calculation History
                </p>
                <button
                  type="button"
                  onClick={() => setCalculationHistory([])}
                  className="text-[10px] text-red-600 hover:text-red-800 font-bold uppercase"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {calculationHistory.slice().reverse().map((calc, idx) => (
                <div
                  key={idx}
                  className="p-3 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setDisplayValue(calc.result.toString());
                    onChange(calc.result.toString());
                    setShowHistory(false);
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-slate-600 truncate">
                        {calc.expression}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {calc.timestamp}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">=</span>
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        {calc.result.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ArticleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { options } = useConfig(); 

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ 
    article_no: '', 
    season: '', 
    size: '', 
    category: '', 
    fabric_type: '', 
    description: '', 
    quantity: '',
    sales_rate: '' 
  });

  const [rates, setRates] = useState([]); 
  const [currentRate, setCurrentRate] = useState({ description: '', price: '' });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Refs for keyboard navigation
  const firstInputRef = useRef(null);
  const costDescriptionRef = useRef(null);
  
  const step1Refs = {
    season: useRef(null),
    category: useRef(null),
    size: useRef(null),
    fabric_type: useRef(null),
    quantity: useRef(null),
    description: useRef(null),
  };

  const step2Refs = {
    costDescription: useRef(null),
    costPrice: useRef(null),
  };

  // Focus first input on step change
  useEffect(() => {
    if (step === 2 && step2Refs.costDescription.current) {
      setTimeout(() => step2Refs.costDescription.current?.focus(), 100);
    } else if (firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [step]);

  // Load existing data for edit mode
  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      articlesAPI.getOne(id)
        .then((res) => {
          const data = res.data.data;
          setFormData({
            article_no: data.article_no,
            season: data.season,
            size: data.size,
            category: data.category,
            fabric_type: data.fabric_type,
            description: data.description || '',
            quantity: data.quantity || '',
            sales_rate: data.sales_rate,
          });
          setRates(data.rates || []);
          
          if (data.image) {
            setImagePreview(`http://localhost:5000/${data.image}`); 
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load article");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  // Dynamic Options
  const seasonOptions = useMemo(() => 
    [...new Set(options?.seasons || [])].map(s => ({ value: s, label: s })), [options]);

  const categoryOptions = useMemo(() => 
    [...new Set(options?.categories || [])].map(c => ({ value: c, label: c })), [options]);

  const sizeOptions = useMemo(() => 
    [...new Set(options?.sizes || [])].map(s => ({ value: s, label: s })), [options]);

  // Calculations
  const total_cost = useMemo(() => 
    rates.reduce((sum, i) => sum + (parseFloat(i.price) || 0), 0), [rates]);

  const profit = useMemo(() => {
    const sales = parseFloat(formData.sales_rate) || 0;
    return sales > 0 ? sales - total_cost : 0;
  }, [formData.sales_rate, total_cost]);

  // Add cost item
  const handleAddCost = () => {
    if (!currentRate.description?.trim()) {
      toast.warning("Enter cost description");
      step2Refs.costDescription.current?.focus();
      return;
    }
    if (!currentRate.price || parseFloat(currentRate.price) <= 0) {
      toast.warning("Enter valid price");
      return;
    }

    setRates([...rates, { 
      description: currentRate.description.trim(), 
      price: parseFloat(currentRate.price) 
    }]);
    
    setCurrentRate({ description: '', price: '' });
    step2Refs.costDescription.current?.focus();
  };

  // Handle keyboard navigation
  const handleStepKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (step < 3) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  // Form submission
  const handleSubmit = async () => {
    if (!formData.article_no || !formData.season || !formData.size || !formData.category || !formData.fabric_type || !formData.sales_rate) {
      return toast.error("Please fill all required fields marked with *");
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      data.append('rates', JSON.stringify(rates));

      if (imageFile) {
        data.append('image', imageFile);
      }

      const response = isEdit ? await articlesAPI.update(id, data) : await articlesAPI.create(data);

      if (response.data.success) {
        toast.success(isEdit ? "Article updated!" : "Article created!");
        navigate('/articles');
      }
    } catch (error) {
      toast.error(error.response?.data?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-5">
      <PageHeader 
        title={isEdit ? 'Update Article' : 'New Creation'}
        subtitle={`Step ${step} / 3`}
        showBack={true}
        backPath="/articles"
        rightElement={
          <div className="flex gap-2 bg-slate-100 p-1.5 rounded-full border border-slate-200">
            {[1, 2, 3].map((num) => (
              <motion.div 
                key={num} 
                layout
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  step === num ? 'w-8 bg-slate-900' : 'w-2 bg-slate-300'
                }`}
              />
            ))}
          </div>
        }
      />

      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 items-start h-full gap-5 overflow-hidden"
        >
          <div className="lg:col-span-8 h-full overflow-hidden">
            <div className="bg-white border border-slate-200 rounded-3xl h-full overflow-hidden p-1.5 flex flex-col">
              <div className="p-6 md:p-7 flex-1 flex flex-col overflow-hidden">
                <AnimatePresence mode="wait">
                  {/* STEP 1: General Info */}
                  {step === 1 && (
                    <motion.div 
                      key="s1" 
                      initial={{ opacity: 0, x: -20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: 20 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      <Input 
                        ref={firstInputRef}
                        label="Article No." 
                        placeholder="Enter article no." 
                        value={formData.article_no} 
                        onChange={(e) => setFormData({ ...formData, article_no: e.target.value })}
                        onEnter={() => step1Refs.season.current?.focus()}
                      />
                      <Select 
                        ref={step1Refs.season}
                        label="Season" 
                        options={seasonOptions} 
                        value={formData.season} 
                        onChange={(v) => setFormData({ ...formData, season: v })}
                        onSelect={() => step1Refs.category.current?.focus()}
                      />
                      <Select 
                        ref={step1Refs.category}
                        label="Category" 
                        options={categoryOptions} 
                        value={formData.category} 
                        onChange={(v) => setFormData({ ...formData, category: v })}
                        onSelect={() => step1Refs.size.current?.focus()}
                      />
                      <Select 
                        ref={step1Refs.size}
                        label="Size" 
                        options={sizeOptions} 
                        value={formData.size} 
                        onChange={(v) => setFormData({ ...formData, size: v })}
                        onSelect={() => step1Refs.fabric_type.current?.focus()}
                      />
                      <Input 
                        ref={step1Refs.fabric_type}
                        label="Fabric Type" 
                        placeholder="Enter fabric type"  
                        value={formData.fabric_type} 
                        onChange={(e) => setFormData({ ...formData, fabric_type: e.target.value })}
                        onEnter={() => step1Refs.quantity.current?.querySelector('input')?.focus()}
                      />
                      <div ref={step1Refs.quantity}>
                        <QuantityInput
                          label="Quantity"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          onEnter={() => step1Refs.description.current?.focus()}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Textarea 
                          ref={step1Refs.description}
                          label="Description" 
                          required={false} 
                          value={formData.description} 
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                              e.preventDefault();
                              setStep(2);
                            }
                          }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: Costing & Rates */}
                  {step === 2 && (
                    <motion.div 
                      key="s2" 
                      initial={{ opacity: 0, x: -20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: 20 }}
                      className="flex flex-col h-full gap-4"
                    >
                      <div className="bg-slate-200/65 p-5 rounded-2xl border border-slate-300 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            ref={step2Refs.costDescription}
                            label="Cost Description"
                            placeholder="e.g., Fabric - Cotton, Labor - Cutting"
                            value={currentRate.description}
                            onChange={(e) => setCurrentRate({ ...currentRate, description: e.target.value })}
                            onEnter={() => step2Refs.costPrice.current?.querySelector('input')?.focus()}
                          />
                          
                          <div ref={step2Refs.costPrice}>
                            <CalculatorInput
                              label="Price (PKR)"
                              value={currentRate.price}
                              onChange={(val) => setCurrentRate({ ...currentRate, price: val })}
                              placeholder="Enter price or calculate"
                              onEnter={handleAddCost}
                            />
                          </div>
                        </div>
                        
                        <Button 
                          onClick={handleAddCost}
                          size='lg' 
                          variant='dark' 
                          className="w-full" 
                          icon={Plus}
                        >
                          Add Cost (Enter)
                        </Button>
                      </div>

                      <div className="flex-1 min-h-0 overflow-y-auto">
                        {rates.length > 0 && (
                          <div className="grid gap-2">
                            {rates.map((item, i) => (
                              <div 
                                key={i} 
                                className="flex justify-between items-center px-5 py-2.5 bg-white border border-slate-300 rounded-2xl hover:border-slate-400 transition-all"
                              >
                                <div>
                                  <p className="text-sm font-bold text-slate-800">{item.description}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="font-bold">Rs. {item.price.toLocaleString()}</span>
                                  <button 
                                    onClick={() => setRates(rates.filter((_, idx) => idx !== i))} 
                                    className="text-red-500 p-2 hover:bg-red-100 rounded-lg transition-all duration-300"
                                    aria-label="Delete cost item"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="bg-slate-200/65 p-5 rounded-2xl border border-slate-300">
                        <CalculatorInput
                          label="Sales Rate (PKR)"
                          value={formData.sales_rate}
                          onChange={(val) => setFormData({ ...formData, sales_rate: val })}
                          placeholder="Enter sales rate or calculate"
                          onEnter={() => setStep(3)}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: Image Upload */}
                  {step === 3 && (
                    <motion.div 
                      key="s3" 
                      initial={{ opacity: 0, x: -20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: 20 }}
                      className="flex flex-col items-center py-4"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSubmit();
                        }
                      }}
                      tabIndex={0}
                    >
                      <div className="w-full max-w-md border-2 border-dashed border-slate-300 rounded-3xl p-12 flex flex-col items-center bg-slate-100 hover:bg-slate-200/70 transition-all duration-300 relative group">
                        {imagePreview ? (
                          <div className="relative w-full">
                            <img 
                              src={imagePreview} 
                              className="w-full h-72 object-contain rounded-3xl" 
                              alt="Preview" 
                            />
                            <button 
                              onClick={() => { setImagePreview(null); setImageFile(null); }} 
                              className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-full transform translate-x-2 -translate-y-2 hover:scale-110 transition-transform"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center">
                            <div className="w-16 h-16 bg-white rounded-2xl border border-slate-300 flex items-center justify-center mb-4">
                              <Upload size={28} className="text-slate-500" />
                            </div>
                            <p className="text-sm font-bold text-slate-900 tracking-wide">Upload Article Image</p>
                            <p className="text-xs text-slate-500 mt-1">PNG, JPG or WebP (Max 5MB)</p>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) { 
                                  setImageFile(file); 
                                  setImagePreview(URL.createObjectURL(file)); 
                                }
                              }} 
                            />
                          </label>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-4 italic">
                        Press Enter or click Continue to {isEdit ? 'update' : 'publish'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Form Footer */}
              <div className="p-5 bg-slate-200/80 border border-slate-200 flex justify-between items-center rounded-2xl">
                <Button 
                  disabled={step === 1} 
                  onClick={() => setStep(step - 1)} 
                  size='lg' 
                  variant='dark' 
                  icon={ArrowLeft}
                >
                  Back
                </Button>
                
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">
                    Step {step} of 3
                  </span>
                  <Button 
                    onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()} 
                    loading={loading} 
                    size='lg' 
                    variant='dark' 
                    icon={step === 3 ? Check : ArrowRight} 
                    iconPosition="right"
                  >
                    {step === 3 ? (isEdit ? 'Update Article' : 'Publish Article') : 'Continue'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Summary */}
          <aside className="lg:col-span-4 grid gap-5">
            <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
              <p className="text-[12px] font-semibold uppercase text-indigo-500 mb-6 tracking-widest text-center border-b border-slate-700 pb-4">
                Live Analysis
              </p>
              <div>
                <Stat label="Production Cost" value={`Rs. ${total_cost.toLocaleString()}`} />
                <Stat 
                  label="Projected Profit" 
                  value={`Rs. ${profit.toLocaleString()}`} 
                  color={profit > 0 ? "text-emerald-400" : "text-red-400"} 
                />
                <div className="pt-2 mt-2 border-t border-slate-700">
                  <Stat label="SKU / Article" value={formData.article_no || '---'} />
                  <Stat label="Main Category" value={formData.category || '---'} />
                </div>
              </div>
            </div>
            
            <div className="bg-indigo-600 rounded-3xl p-6 text-white flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Hash size={24} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase opacity-70 tracking-wide">Status</p>
                <p className="text-sm font-medium tracking-wide">
                  {isEdit ? 'Modifying Article' : 'Drafting New Article'}
                </p>
              </div>
            </div>
          </aside>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const Stat = ({ label, value, color = "text-white" }) => (
  <div className="flex justify-between py-1">
    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
    <p className={`text-[13px] font-medium tracking-wide ${color}`}>{value}</p>
  </div>
);

export default ArticleForm;