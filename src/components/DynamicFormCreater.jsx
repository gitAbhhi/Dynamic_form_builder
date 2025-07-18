import React, { useState, useEffect } from 'react';
import { Upload, Calendar, ChevronDown, X, Check } from 'lucide-react';
import { schemas } from '../assets/Schema';

const DynamicFormCreator = () => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submittedData, setSubmittedData] = useState(null);
  const [currentSchema, setCurrentSchema] = useState('basic');

  
  // Initialize form data with default values
  useEffect(() => {
    const initializeFormData = (schema, parentPath = '') => {
      const initialData = {};
      schema.forEach(field => {
        const fieldPath = parentPath ? `${parentPath}.${field.name}` : field.name;
        if (field.type === 'card') {
          initialData[field.name] = {};
          const nestedData = initializeFormData(field.data, fieldPath);
          initialData[field.name] = nestedData;
        } else {
          initialData[field.name] = field.value || (field.type === 'multiselect' ? [] : '');
        }
      });
      return initialData;
    };

    setFormData(initializeFormData(schemas[currentSchema]));
    setErrors({});
    setSubmittedData(null);
  }, [currentSchema]);

  // Validation function
  const validateField = (field, value, fieldPath = '') => {
    const fullPath = fieldPath ? `${fieldPath}.${field.name}` : field.name;
    
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return field.error || `${field.title} is required`;
    }

    if (field.validator && value) {
      const regex = new RegExp(field.validator);
      if (!regex.test(value)) {
        return field.error || `Invalid ${field.title}`;
      }
    }

    if (field.min !== undefined && value) {
      if (field.type === 'number' && parseFloat(value) < parseFloat(field.min)) {
        return field.error || `${field.title} must be at least ${field.min}`;
      }
      if (['date', 'datetime'].includes(field.type) && new Date(value) < new Date(field.min)) {
        return field.error || `${field.title} must be after ${field.min}`;
      }
    }

    if (field.max !== undefined && value) {
      if (field.type === 'number' && parseFloat(value) > parseFloat(field.max)) {
        return field.error || `${field.title} must be at most ${field.max}`;
      }
      if (['date', 'datetime'].includes(field.type) && new Date(value) > new Date(field.max)) {
        return field.error || `${field.title} must be before ${field.max}`;
      }
    }

    return null;
  };

  // Handle input change
  const handleInputChange = (field, value, fieldPath = '') => {
    const fullPath = fieldPath ? `${fieldPath}.${field.name}` : field.name;
    
    setFormData(prev => {
      const newData = { ...prev };
      const pathParts = fullPath.split('.');
      let current = newData;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) current[pathParts[i]] = {};
        current = current[pathParts[i]];
      }
      
      current[pathParts[pathParts.length - 1]] = value;
      return newData;
    });

    // Real-time validation
    const error = validateField(field, value, fieldPath);
    setErrors(prev => ({
      ...prev,
      [fullPath]: error
    }));
  };

  // Handle file upload
  const handleFileUpload = async (field, file, fieldPath = '') => {
    const fullPath = fieldPath ? `${fieldPath}.${field.name}` : field.name;
    
    try {
      // Simulate file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // In a real implementation, you would make an actual API call
      // const response = await fetch(field.data.url, {
      //   method: field.data.method,
      //   headers: field.data.headers,
      //   body: formData
      // });
      
      // For demo purposes, we'll just store the file name
      handleInputChange(field, file.name, fieldPath);
      
    } catch (error) {
      console.error('File upload failed:', error);
      setErrors(prev => ({
        ...prev,
        [fullPath]: 'File upload failed'
      }));
    }
  };

  // Render form field
  const renderField = (field, fieldPath = '') => {
    const fullPath = fieldPath ? `${fieldPath}.${field.name}` : field.name;
    const value = getNestedValue(formData, fullPath) || '';
    const error = errors[fullPath];

    const commonProps = {
      id: fullPath,
      className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`,
      placeholder: field.placeholder,
      onChange: (e) => handleInputChange(field, e.target.value, fieldPath)
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <input
            {...commonProps}
            type={field.type}
            value={value}
          />
        );

      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            min={field.min}
            max={field.max}
            step={field.resolution}
            value={value}
          />
        );

      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
            value={value}
          />
        );

      case 'date':
      case 'datetime':
        return (
          <input
            {...commonProps}
            type={field.type === 'datetime' ? 'datetime-local' : 'date'}
            min={field.min}
            max={field.max}
            value={value}
          />
        );

      case 'select':
        return (
          <select
            {...commonProps}
            value={value}
          >
            <option value="">Select an option</option>
            {field.data?.map(option => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.data?.map(option => (
              <label key={option.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option.id)}
                  onChange={(e) => {
                    const newValue = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) {
                      newValue.push(option.id);
                    } else {
                      const index = newValue.indexOf(option.id);
                      if (index > -1) newValue.splice(index, 1);
                    }
                    handleInputChange(field, newValue, fieldPath);
                  }}
                  className="rounded focus:ring-blue-500"
                />
                <span>{option.title}</span>
              </label>
            ))}
          </div>
        );

      case 'buttons':
        return (
          <div className="flex flex-wrap gap-2">
            {field.data?.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleInputChange(field, option.id, fieldPath)}
                className={`px-4 py-2 rounded-md border ${
                  value === option.id
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option.title}
              </button>
            ))}
          </div>
        );

      case 'file':
        return (
          <div className="space-y-2">
            <input
              type="file"
              id={fullPath}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleFileUpload(field, file, fieldPath);
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {value && (
              <p className="text-sm text-gray-600">Uploaded: {value}</p>
            )}
          </div>
        );

      case 'card':
        return (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="space-y-4">
              {field.data?.map((subField, index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {subField.title}
                    {subField.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(subField, fullPath)}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-red-500">
            Unsupported field type: {field.type}
          </div>
        );
    }
  };

  // Get nested value from object
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Validate entire form
  const validateForm = (schema, data, fieldPath = '') => {
    let isValid = true;
    const newErrors = {};

    schema.forEach(field => {
      const fullPath = fieldPath ? `${fieldPath}.${field.name}` : field.name;
      const value = getNestedValue(data, fullPath);

      if (field.type === 'card') {
        const nestedValidation = validateForm(field.data, data, fullPath);
        if (!nestedValidation.isValid) {
          isValid = false;
          Object.assign(newErrors, nestedValidation.errors);
        }
      } else {
        const error = validateField(field, value, fieldPath);
        if (error) {
          isValid = false;
          newErrors[fullPath] = error;
        }
      }
    });

    return { isValid, errors: newErrors };
  };

  // Handle form submission
  const handleSubmit = () => {
    const validation = validateForm(schemas[currentSchema], formData);
    
    if (validation.isValid) {
      setSubmittedData(formData);
      setErrors({});
      alert('Form submitted successfully! Check the JSON output below.');
    } else {
      setErrors(validation.errors);
      alert('Please fix the errors before submitting.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dynamic Form Creator</h1>
      
      {/* Schema Selector */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Test Schema:
        </label>
        <select
          value={currentSchema}
          onChange={(e) => setCurrentSchema(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="basic">Basic Form</option>
          <option value="advanced">Advanced Form (Select, File, Card)</option>
        </select>
      </div>

      {/* Dynamic Form */}
      <div className="space-y-6">
        {schemas[currentSchema].map((field, index) => (
          <div key={index} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.title}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {renderField(field)}
            
            {errors[field.name] && (
              <p className="text-red-500 text-sm">{errors[field.name]}</p>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        >
          Submit Form
        </button>
      </div>

      {/* Submitted Data Display */}
      {submittedData && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-lg font-semibold text-green-800 mb-2">
            Submitted Data (JSON):
          </h2>
          <pre className="bg-white p-3 rounded border text-sm overflow-x-auto">
            {JSON.stringify(submittedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DynamicFormCreator;