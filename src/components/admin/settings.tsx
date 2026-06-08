"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Trash2, UserPlus, Mail, X, Search, PlusCircle, Plus } from 'lucide-react';
import avatar2 from '/public/assets/avatar-2.jpg';
import { toast } from 'sonner';
import { Input } from '../ui/input';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CustomSwitch } from '../ui/custom-switch';
import { useSendInviteMutation, useGetTeamMembersQuery, useRemoveTeamMemberMutation, useUpdateUserRoleMutation } from '@/lib/feature/invite/inviteApi';

interface FormInputs {
  email: string;
  isAdmin: boolean;
}

export default function SetttingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.get('search');
    if (query) setSearchTerm(query);
  }, [searchParams]);

  // API Hooks
  const { data: teamData, isLoading: isTeamLoading, refetch: refetchTeam } = useGetTeamMembersQuery();
  const [sendInvite, { isLoading: isInviting }] = useSendInviteMutation();
  const [removeMember, { isLoading: isRemoving }] = useRemoveTeamMemberMutation();
  const [updateRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormInputs>({
    defaultValues: {
      email: '',
      isAdmin: false
    }
  });


  const onSubmit = async (data: FormInputs) => {
    try {
      const res = await sendInvite({
        email: data.email,
        isAdmin: data.isAdmin
      }).unwrap();

      toast.success(res.message || 'Invitation sent successfully to ' + data.email);
      setIsModalOpen(false);
      reset();
      refetchTeam();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to send invitation');
    }
  };

  const handleRoleToggle = async (id: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'ADMIN' ? 'TEACHER' : 'ADMIN';
      await updateRole({ id, role: newRole }).unwrap();
      toast.success(`Role updated to ${newRole}`);
      refetchTeam();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update role');
    }
  };

  const handleRemoveClick = (id: string) => {
    setMemberToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmRemoveMember = async () => {
    if (memberToDelete) {
      try {
        await removeMember(memberToDelete).unwrap();
        toast.success('Team member removed');
        setDeleteModalOpen(false);
        setMemberToDelete(null);
        refetchTeam();
      } catch (error: any) {
        toast.error(error?.data?.message || 'Failed to remove member');
      }
    }
  };

  if (!mounted) return null;

  // Filter data based on search term
  const allMembers = teamData?.data || [];
  const displayMembers = allMembers.filter((m: any) =>
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const adminCount = allMembers.filter((m: any) => m.role?.toUpperCase() === 'ADMIN').length;

  return (
    <div className={`space-y-6 mt-10 transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>

      {/* Team Directory Section */}
      <div className="p-0 border border-[#2A2A2A] rounded-2xl bg-[#0F0F0F] overflow-hidden shadow-2xl">
        <div className="p-6 pb-4 flex flex-col md:flex-row md:items-center justify-between border-b border-[#2A2A2A]/50 gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#E5E5E5]">Team Directory</h2>
            <p className="text-[#888888] text-sm mt-1">
              {allMembers.length} members • {adminCount} admins
            </p>
          </div>

          <div className="flex items-center gap-3 flex-1 md:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl py-2 pl-10 pr-4 text-sm text-[#E5E5E5] focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-10 h-10 flex-shrink-0 rounded-full border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="mx-6 mb-8 border border-primary/20 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[#888888] text-xs font-medium uppercase border-b border-[#2A2A2A]">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Admin Access</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]/30">
              {isTeamLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[#888888]">Loading members...</td>
                </tr>
              ) : displayMembers.map((member: any) => (
                <tr key={member.id} className="group hover:bg-[#1A1A1A] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#2A2A2A] bg-primary/10 flex items-center justify-center">
                        {member.profilePicture ? (
                          <Image
                            src={member.profilePicture}
                            alt={member.firstName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-primary">
                            {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[#E5E5E5]">{member.firstName} {member.lastName}</span>
                        <span className="text-xs text-[#888888]">{member.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#E5E5E5]">{member.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0E2A1B] text-[#4ADE80] text-xs font-semibold w-fit border border-[#4ADE80]/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                      Active
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#888888]">{member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <CustomSwitch
                      checked={member.role === 'ADMIN'}
                      onCheckedChange={() => handleRoleToggle(member.id, member.role)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleRemoveClick(member.id)}
                      className="p-2 text-[#888888] hover:text-[#EF4444] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {displayMembers.length === 0 && !isTeamLoading && (
            <div className="p-10 text-center">
              <p className="text-[#888888] text-sm">No team members found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-2xl w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <div className="p-6">
              <h2 className="text-xl font-bold text-[#E5E5E5] mb-6">Invite New User</h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-[#E5E5E5] block mb-2">Email</label>
                  <Input
                    placeholder="Enter email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
                    })}
                    className="w-full h-12 rounded-lg px-4 border-[#2A2A2A] bg-[#1A1A1A] text-[#E5E5E5] focus:border-primary/50"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-12 border border-primary text-primary rounded-xl font-semibold hover:bg-primary/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    disabled={isInviting}
                    className="flex-1 h-12 bg-primary text-black rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  >
                    {isInviting ? 'Sending...' : 'Send Invite'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#E5E5E5]">Remove Member</AlertDialogTitle>
            <AlertDialogDescription className="text-[#888888]">
              Are you sure you want to remove this team member? This action cannot be undone, and they will lose access to all classroom tools and student records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-[#2A2A2A] text-[#888888] hover:bg-[#1A1A1A] hover:text-[#E5E5E5]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveMember}
              className="bg-[#EF4444] text-white hover:bg-[#EF4444]/90"
            >
              {isRemoving ? 'Removing...' : 'Remove Member'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
