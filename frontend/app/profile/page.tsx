"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  ShieldCheck,
  Calendar,
  Save,
  Lock,
  Loader2,
  Camera,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { User as UserType } from "@/types";
import { formatDate } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { success, error } = useToast();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedName = localStorage.getItem("current_user_name");
    const savedEmail = localStorage.getItem("current_user_email");
    const savedImage = localStorage.getItem("current_user_image");

    api.profile
      .get()
      .then((data) => {
        // If Better Auth / Google Session has updated user info, prefer Google info
        if (session?.user) {
          const googleUser = session.user;
          const mergedData = {
            ...data,
            name: googleUser.name || data.name,
            email: googleUser.email || data.email,
            image: googleUser.image || data.image,
          };
          setUser(mergedData);
          setName(mergedData.name || "");
        } else {
          setUser({
            ...data,
            name: savedName || data.name,
            email: savedEmail || data.email,
            image: savedImage || data.image,
          });
          setName(savedName || data.name);
        }
      })
      .catch(() => {
        const defaultUser: UserType = {
          id: "usr_demo",
          name: savedName || session?.user?.name || "Alex Morgan",
          email: savedEmail || session?.user?.email || "demo@onelogistics.com",
          image:
            savedImage ||
            session?.user?.image ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          email_verified: true,
          created_at: new Date().toISOString(),
        };
        setUser(defaultUser);
        setName(defaultUser.name);
      })
      .finally(() => setLoading(false));
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const updated = await api.profile.update({ name });
      setUser(updated);
      success("Profile details updated successfully.", "Profile Updated");
    } catch (err: any) {
      error(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const updated = await api.profile.uploadImage(file);
      setUser(updated);
      success("Profile picture updated.", "Avatar Uploaded");
    } catch (err: any) {
      error(err.message || "Failed to upload avatar image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    if (newPassword !== confirmPassword) {
      error("New passwords do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      await api.profile.changePassword(currentPassword, newPassword);
      success("Account password changed successfully.", "Security Updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      error(
        err.message ||
          "Failed to change password. Please verify current password.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <AppShell title="User Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#17231b] dark:text-white tracking-tight">
            Account Profile & Identity
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9bb3a1] mt-0.5">
            Manage your verified shipping identity, profile avatar, and account
            credentials.
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#d9ff69]" />
            Loading profile information...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Card: Avatar & Summary */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#1f2e24] border border-[#e2ebd0]/80 dark:border-[#2d4234] shadow-xs text-center space-y-4">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-[#d9ff69] text-slate-950 flex items-center justify-center text-3xl font-black shadow-md mx-auto overflow-hidden">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0) || "U"
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-[#d9ff69] hover:bg-[#cbf748] text-slate-950 font-bold shadow-md transition-transform hover:scale-105 cursor-pointer"
                  title="Upload profile picture"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5" />
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-[#17231b] dark:text-white">
                  {user?.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#9bb3a1] break-all">
                  {user?.email}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-[#2d4234] space-y-2 text-left text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Status
                  </span>
                  <span className="font-bold text-emerald-600">
                    Verified Shipper
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Member Since
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-[#edf7cd]/90">
                    {user?.created_at ? formatDate(user.created_at) : "Recent"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Card: Edit Name & Security */}
            <div className="md:col-span-2 space-y-6">
              {/* Profile Details Form */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#1f2e24] border border-[#e2ebd0]/80 dark:border-[#2d4234] shadow-xs space-y-4">
                <div className="flex items-center gap-2 font-bold text-sm text-[#17231b] dark:text-white">
                  <User className="w-4 h-4 text-[#d9ff69]" />
                  <span>Personal Information</span>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                      Full Legal Name / Business Identity
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                      Registered Account Email (Immutable)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        disabled
                        value={user?.email || ""}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-100 dark:bg-[#25372b]/50 text-xs text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-[#d9ff69] hover:bg-[#cbf748] text-slate-950 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Save Changes</span>
                  </button>
                </form>
              </div>

              {/* Password Change Form */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#1f2e24] border border-[#e2ebd0]/80 dark:border-[#2d4234] shadow-xs space-y-4">
                <div className="flex items-center gap-2 font-bold text-sm text-[#17231b] dark:text-white">
                  <Lock className="w-4 h-4 text-[#d9ff69]" />
                  <span>Security & Credentials</span>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current account password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {changingPassword ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                    <span>Update Password</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
