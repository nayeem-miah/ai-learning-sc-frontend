"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Copy, ArrowRight, Loader, AlertCircle, Camera } from 'lucide-react';
import Image from 'next/image';
import { useGetMeQuery, useUpdateUserProfileMutation } from '@/lib/feature/auth/authApi';
import { toast } from 'sonner';

const InputField = ({ label, value, onChange, type = "text", hasIcon = false, readOnly = false }: any) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-zinc-400 text-xs font-medium ml-0.5">{label}</label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`w-full bg-[#2A261D]/60 border border-white/5 rounded-lg px-4 py-3 text-zinc-200 text-sm focus:outline-none focus:border-[#C08F42]/30 ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
      />
      {hasIcon && (
        <button 
          onClick={() => {
            navigator.clipboard.writeText(value);
            toast.success("Copied to clipboard");
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#C08F42] transition-colors"
        >
          <Copy size={16} />
        </button>
      )}
    </div>
  </div>
);

export default function EditProfile() {
  const { data: userResponse, isLoading, error } = useGetMeQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (userResponse?.data) {
      const user = userResponse.data;
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      }));
      setPreviewUrl(user.profilePicture || null);
    }
  }, [userResponse]);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      };

      if (formData.currentPassword) {
        payload.currentPassword = formData.currentPassword;
      }
      
      if (formData.newPassword) {
        payload.newPassword = formData.newPassword;
      }

      const submitData = new FormData();
      if (selectedFile) {
        submitData.append('file', selectedFile);
      }
      submitData.append('data', JSON.stringify(payload));

      await updateProfile(submitData).unwrap();
      toast.success("Profile updated successfully");
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setSelectedFile(null);
      
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-white">
        <Loader className="w-12 h-12 text-[#C08F42] animate-spin mb-4" />
        <h2 className="text-xl font-bold">Loading Profile...</h2>
      </div>
    );
  }

  const user = userResponse?.data;
  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-white p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Failed to load profile</h2>
        <p className="text-zinc-400">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 text-white">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Header Section */}
        <div className="">
          <h1 className="text-[#C08F42] text-3xl font-medium">Edit Profile</h1>
          <p className="text-zinc-500 text-md mt-1">Manage your account settings</p>
        </div>

        {/* Profile Information */}
        <div className="bg-[#121212] border border-white/10 rounded-xl p-8">
          <h2 className="text-2xl font-medium mb-8">Profile Information</h2>
          
          <div className="flex flex-col gap-3 mb-8">
            <span className="text-zinc-400 text-xs font-medium">Profile Photo</span>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-800 border border-white/10 relative">
                  <Image 
                    src={previewUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher"} 
                    alt="Profile" 
                    fill
                    className="object-cover"
                  />
                </div>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera size={16} className="text-white" />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden" 
                accept="image/*"
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 bg-[#121212] border border-[#C08F42]/50 text-[#C08F42] text-xs font-bold rounded-md hover:bg-[#C08F42]/5 transition-colors"
              >
                Change Photo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
            <InputField label="First Name" value={formData.firstName} onChange={handleInputChange('firstName')} />
            <InputField label="Last Name" value={formData.lastName} onChange={handleInputChange('lastName')} />
            <InputField label="Email Address" value={formData.email} onChange={handleInputChange('email')} readOnly={true} />
            <InputField label="User ID" value={user.id} hasIcon={true} readOnly={true} />
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-[#121212] border border-white/10 rounded-xl p-8">
          <h2 className="text-2xl font-medium mb-8">Change Password</h2>
          <div className="flex flex-col gap-6">
            <InputField 
              label="Current Password" 
              value={formData.currentPassword} 
              onChange={handleInputChange('currentPassword')} 
              type="password" 
            />
            <InputField 
              label="New Password" 
              value={formData.newPassword} 
              onChange={handleInputChange('newPassword')} 
              type="password" 
            />
            <InputField 
              label="Confirm New Password" 
              value={formData.confirmPassword} 
              onChange={handleInputChange('confirmPassword')} 
              type="password" 
            />
          </div>
        </div>

        {/* Update Button */}
        <div className="flex justify-end mt-2">
          <button 
            type="submit"
            disabled={isUpdating}
            className="flex items-center gap-2 px-8 py-3.5 bg-[#D1AC70] hover:bg-[#C08F42] text-[#1A1A1A] font-bold rounded-md transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {isUpdating ? (
              <>
                Updating...
                <Loader size={20} className="animate-spin" />
              </>
            ) : (
              <>
                Update Profile
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}