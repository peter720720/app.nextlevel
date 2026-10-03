import React, { useState } from 'react';
import { CheckCircle2, School, Mail, Lock, Phone, MapPin, User, ArrowRight } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

const Pricing = () => {
  const [formData, setFormData] = useState({
    schoolName: '', contactEmail: '', contactPhone: '', address: '',
    adminFirstName: '', adminLastName: '', adminEmail: '', password: ''
  });
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const plans = [
    { id: 'basic', name: 'Basic Plan', price: 'Free (14-day trial)', features: ['Up to 200 Students', '1 Admin Account', 'Basic Grading System', 'Attendance Logs'] },
    { id: 'standard', name: 'Standard Plan', price: '\$49/month', features: ['Up to 1000 Students', '5 Admin Accounts', 'Automated Report Cards', 'Parent Notification Portals'] },
    { id: 'premium', name: 'Premium Plan', price: '\$99/month', features: ['Unlimited Students', 'Unlimited Admins', 'Fee Management + Invoicing', 'Custom School Subdomain', '24/7 Dedicated Support'] }
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Send the school and admin generation criteria to our backend server api
      const response = await axiosInstance.post('/schools/create', {
        name: formData.schoolName,
        email: formData.contactEmail,
        phone: formData.contactPhone,
        address: formData.address,
        adminFirstName: formData.adminFirstName,
        adminLastName: formData.adminLastName,
        adminEmail: formData.adminEmail,
        password: formData.password,
        planPackage: selectedPlan
      });

      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: '🎉 Workspace created successfully! You can now log into your administrator profile panel.' 
        });
        setFormData({ schoolName: '', contactEmail: '', contactPhone: '', address: '', adminFirstName: '', adminLastName: '', adminEmail: '', password: '' });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to create your school workspace environment.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-schoolBlue sm:text-4xl">Choose Your Package & Create Your School</h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          Select a package tier below to initialize your school setup environment. All subscription paths start with a free trial.
        </p>
      </div>

      {/* Pricing Cards Selection Row */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`cursor-pointer bg-white rounded-2xl p-6 shadow-md border-2 transition transform hover:-translate-y-1 ${
              selectedPlan === plan.id ? 'border-schoolAmber ring-4 ring-amber-100' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              {selectedPlan === plan.id && <span className="bg-amber-100 text-schoolAmber text-xs font-bold px-2.5 py-1 rounded-full uppercase">Selected</span>}
            </div>
            <p className="text-3xl font-extrabold text-schoolBlue mb-6">{plan.price}</p>
            <ul className="space-y-3 mb-6">
              {plan.features.map((feat, index) => (
                <li key={index} className="flex items-start text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Registration Form Segment */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-schoolBlue mb-6 text-center border-b pb-4">
          Workspace Account Creation Profile (<span className="capitalize text-schoolAmber">{selectedPlan} Tier</span>)
        </h2>

        {message.text && (
          <div className={`p-4 rounded-lg mb-6 text-sm font-semibold ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Institution Details */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">1. School Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative"><School className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" /><input type="text" name="schoolName" placeholder="School Name" required value={formData.schoolName} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-schoolBlue" /></div>
              <div className="relative"><Mail className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" /><input type="email" name="contactEmail" placeholder="School Email Address" required value={formData.contactEmail} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-schoolBlue" /></div>
              <div className="relative"><Phone className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" /><input type="text" name="contactPhone" placeholder="School Official Phone Number" required value={formData.contactPhone} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-schoolBlue" /></div>
              <div className="relative"><MapPin className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" /><input type="text" name="address" placeholder="Physical Address Location" required value={formData.address} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-schoolBlue" /></div>
            </div>
          </div>

          {/* Section 2: Admin Profile Generation Setup */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">2. Main School Administrator Setup</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative"><User className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" /><input type="text" name="adminFirstName" placeholder="Admin First Name" required value={formData.adminFirstName} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-schoolBlue" /></div>
              <div className="relative"><User className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" /><input type="text" name="adminLastName" placeholder="Admin Last Name" required value={formData.adminLastName} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-schoolBlue" /></div>
              <div className="relative"><Mail className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" /><input type="email" name="adminEmail" placeholder="Personal Admin Email (For Login)" required value={formData.adminEmail} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-schoolBlue" /></div>
              <div className="relative"><Lock className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" /><input type="password" name="password" placeholder="Create Secure System Password" required value={formData.password} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-schoolBlue" /></div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-schoolBlue hover:bg-blue-900 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{loading ? 'Initializing School Infrastructure...' : 'Deploy School Workspace Account'}</span>
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Pricing;
