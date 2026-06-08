"use client";
import Image from "next/image";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChangeEvent, useRef, useState, useEffect } from "react";
import { ChevronRight, Copy, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import avatarDefault from "/public/assets/avatar.png";
import { useGetMeQuery, useUpdateUserProfileMutation } from "@/lib/feature/auth/authApi";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  email: z.string().email("Invalid email address"),
  currentPassword: z.string().optional().or(z.literal('')),
  newPassword: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
}).refine((data) => {
  if (data.newPassword && data.newPassword.length >= 8) {
    return data.newPassword === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function AdminProfilePage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: userData, isLoading: isUserLoading } = useGetMeQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  });

  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");

  // Logic: Disable if passwords don't match
  const isPasswordMismatch = newPassword !== confirmPassword;

  useEffect(() => {
    if (userData?.data) {
      setValue("firstName", userData.data.firstName || "");
      setValue("lastName", userData.data.lastName || "");
      setValue("email", userData.data.email || "");
      if (userData.data.profilePicture) {
        setSelectedImage(userData.data.profilePicture);
      }
    }
  }, [userData, setValue]);


  const firstName = watch("firstName");
  const lastName = watch("lastName");

  const getInitials = () => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      toast.info("Photo selected! Click 'Update Profile' to save.");
    }
  };


  const onSubmit = async (formData: ProfileFormValues) => {
    try {
      const payload = new FormData();
      
      // According to the Postman image provided:
      // Key "data" should contain a stringified JSON object
      // Key "file" should contain the profile picture file
      
      const dataObj: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
      };

      if (formData.currentPassword && formData.newPassword) {
        dataObj.currentPassword = formData.currentPassword;
        dataObj.newPassword = formData.newPassword;
      }

      payload.append("data", JSON.stringify(dataObj));

      if (imageFile) {
        payload.append("file", imageFile);
      }

      const res = await updateProfile(payload).unwrap();
      
      if (res.success) {
        toast.success(res.message || "Profile updated successfully!");
      }

    } catch (error: any) {
      console.error("Update Error:", error);
      toast.error(error?.data?.message || "Something went wrong. Please try again.");
    }
  };


  const handleCopyId = (userId: string): void => {
    if (!userId) return;
    navigator.clipboard.writeText(userId);
    toast.success("User ID copied to clipboard");
  };

  if (isUserLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* 1. Header Card */}
      <div className="p-8 border rounded-xl shadow-[0_4px_4px_0] shadow-primary/20">
        <h1 className="text-xl md:text-2xl font-semibold text-primary mb-2">Edit Profile</h1>
        <p className="text-secondary text-sm md:text-base font-normal">Manage your account settings</p>
      </div>

      {/* 2. Profile Info Card */}
      <div className="p-8 border rounded-xl shadow-[0_4px_4px_0] shadow-primary/20">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-foreground">Profile Information</h2>

          {/* Photo Section */}
          <div>
            <label className="text-sm font-normal text-foreground">Profile Photo</label>
            <div className="flex items-center gap-5 mt-2">
              <div className="relative h-20 w-20 md:h-24 md:w-24 overflow-hidden rounded-full border-2 border-primary/20 flex items-center justify-center bg-primary/10">
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-2xl md:text-3xl font-bold text-primary">
                    {getInitials()}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 border border-primary text-primary rounded-md text-base font-semibold hover:bg-primary/10 transition-colors cursor-pointer"
              >
                Change Photo
              </button>
              <Input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* Name Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            <div>
              <label className="text-sm font-normal text-foreground">First Name</label>
              <Input
                {...register("firstName")}
                className="w-full h-10 lg:h-12 rounded-lg px-4 border-none bg-primary/20 mt-2"
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="text-sm font-normal text-foreground">Last Name</label>
              <Input
                {...register("lastName")}
                className="w-full h-10 lg:h-12 rounded-lg px-4 border-none bg-primary/20 mt-2"
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Email & ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            <div>
              <label className="text-sm font-normal text-foreground">Email Address</label>
              <Input
                {...register("email")}
                readOnly
                disabled
                className="w-full h-10 lg:h-12 rounded-lg px-4 border-none bg-primary/20 mt-2 opacity-70 cursor-not-allowed"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-sm font-normal text-foreground">User ID</label>
              <div className="relative mt-2">
                <Input
                  value={userData?.data?.id || ""}
                  disabled
                  readOnly
                  className="w-full h-10 lg:h-12 rounded-lg px-4 border-none bg-primary/20 opacity-70 cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => handleCopyId(userData?.data?.id || "")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary cursor-pointer hover:text-primary/80"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Password Card */}
      <div className="p-8 border rounded-xl shadow-[0_4px_4px_0] shadow-primary/20">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Change Password</h2>
          <div className="space-y-4">
            {[
              { 
                label: "Current Password", 
                id: "currentPassword", 
                show: showCurrentPassword, 
                setShow: setShowCurrentPassword 
              },
              { 
                label: "New Password", 
                id: "newPassword", 
                show: showNewPassword, 
                setShow: setShowNewPassword 
              },
              { 
                label: "Confirm New Password", 
                id: "confirmPassword", 
                show: showConfirmPassword, 
                setShow: setShowConfirmPassword 
              }
            ].map((item) => (
              <div key={item.id}>
                <label className="text-sm font-normal text-foreground">{item.label}</label>
                <div className="relative mt-2">
                  <Input
                    type={item.show ? "text" : "password"}
                    placeholder="••••••••"
                    {...register(item.id as keyof ProfileFormValues)}
                    className="w-full h-10 lg:h-12 rounded-lg pl-4 pr-12 border-none bg-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => item.setShow(!item.show)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary transition-colors cursor-pointer"
                  >
                    {item.show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors[item.id as keyof ProfileFormValues] && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors[item.id as keyof ProfileFormValues]?.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Submit Button */}
      <div className="flex justify-center lg:justify-end pt-2">
        <button 
          type="submit" 
          disabled={isUpdating || isPasswordMismatch}
          className={`bg-primary hover:bg-primary/80 text-black font-bold h-10 lg:h-12 px-8 rounded-lg flex items-center gap-3 transition-all group cursor-pointer w-full lg:w-auto justify-center ${ (isUpdating || isPasswordMismatch) ? 'opacity-50 cursor-not-allowed' : '' }`}
        >
          {isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update Profile"}
          {!isUpdating && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
        </button>
      </div>
    </form>
  );
}