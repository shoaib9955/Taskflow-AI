import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Crown,
  ShieldCheck,
  BriefcaseBusiness,
  UserRound,
} from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const initialMemberForm = {
  email: "",
  role: "member",
};

const Team = () => {
  const { user } = useAuth();

  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const [selectedMember, setSelectedMember] = useState(null);

  const [memberForm, setMemberForm] = useState(initialMemberForm);

  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const [formError, setFormError] = useState("");
  const [removeError, setRemoveError] = useState("");

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/workspaces");

      const data = response.data.data;
      const workspaceList = data?.workspaces || data || [];

      setWorkspaces(workspaceList);

      if (workspaceList.length > 0) {
        setSelectedWorkspaceId((previous) => {
          if (
            previous &&
            workspaceList.some((workspace) => workspace._id === previous)
          ) {
            return previous;
          }

          return workspaceList[0]._id;
        });
      } else {
        setSelectedWorkspaceId("");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load team.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const selectedWorkspace = useMemo(() => {
    return workspaces.find(
      (workspace) => workspace._id === selectedWorkspaceId,
    );
  }, [workspaces, selectedWorkspaceId]);

  const members = selectedWorkspace?.members || [];

  const currentMember = members.find(
    (member) => getId(member.user) === user?._id,
  );

  const canManageMembers =
    currentMember && ["owner", "admin"].includes(currentMember.role);

  const filteredMembers = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return members;
    }

    return members.filter((member) => {
      const memberUser = typeof member.user === "object" ? member.user : null;

      const name = memberUser?.name?.toLowerCase() || "";
      const email = memberUser?.email?.toLowerCase() || "";
      const role = member.role?.toLowerCase() || "";

      return (
        name.includes(value) || email.includes(value) || role.includes(value)
      );
    });
  }, [members, search]);

  const openAddModal = () => {
    setMemberForm({
      ...initialMemberForm,
    });

    setFormError("");
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    if (saving) {
      return;
    }

    setShowAddModal(false);
    setFormError("");

    setMemberForm({
      ...initialMemberForm,
    });
  };

  const handleMemberFormChange = (event) => {
    const { name, value } = event.target;

    setMemberForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const handleAddMember = async (event) => {
    event.preventDefault();

    if (!selectedWorkspaceId) {
      setFormError("Please select a workspace.");
      return;
    }

    const email = memberForm.email.trim().toLowerCase();

    if (!email) {
      setFormError("User email is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const response = await api.post(
        `/workspaces/${selectedWorkspaceId}/members`,
        {
          email,
          role: memberForm.role,
        },
      );

      const updatedWorkspace = response.data.data;

      setWorkspaces((previous) =>
        previous.map((workspace) =>
          workspace._id === updatedWorkspace._id ? updatedWorkspace : workspace,
        ),
      );

      closeAddModal();
    } catch (error) {
      setFormError(error.response?.data?.message || "Failed to add member.");
    } finally {
      setSaving(false);
    }
  };

  const openRoleModal = (member) => {
    setSelectedMember(member);

    setMemberForm({
      email: getMemberEmail(member),
      role: member.role || "member",
    });

    setFormError("");
    setShowRoleModal(true);
  };

  const closeRoleModal = () => {
    if (saving) {
      return;
    }

    setShowRoleModal(false);
    setSelectedMember(null);
    setFormError("");

    setMemberForm({
      ...initialMemberForm,
    });
  };

  const handleUpdateRole = async (event) => {
    event.preventDefault();

    if (!selectedWorkspaceId || !selectedMember) {
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const memberId = getId(selectedMember.user);

      const response = await api.patch(
        `/workspaces/${selectedWorkspaceId}/members/${memberId}`,
        {
          role: memberForm.role,
        },
      );

      const updatedWorkspace = response.data.data;

      setWorkspaces((previous) =>
        previous.map((workspace) =>
          workspace._id === updatedWorkspace._id ? updatedWorkspace : workspace,
        ),
      );

      closeRoleModal();
    } catch (error) {
      setFormError(
        error.response?.data?.message || "Failed to update member role.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openRemoveModal = (member) => {
    setSelectedMember(member);
    setRemoveError("");
    setShowRemoveModal(true);
  };

  const closeRemoveModal = () => {
    if (removing) {
      return;
    }

    setShowRemoveModal(false);
    setSelectedMember(null);
    setRemoveError("");
  };

  const handleRemoveMember = async () => {
    if (!selectedWorkspaceId || !selectedMember) {
      return;
    }

    try {
      setRemoving(true);
      setRemoveError("");

      const memberId = getId(selectedMember.user);

      await api.delete(
        `/workspaces/${selectedWorkspaceId}/members/${memberId}`,
      );

      setWorkspaces((previous) =>
        previous.map((workspace) => {
          if (workspace._id !== selectedWorkspaceId) {
            return workspace;
          }

          return {
            ...workspace,
            members: workspace.members.filter(
              (member) => getId(member.user) !== memberId,
            ),
          };
        }),
      );

      closeRemoveModal();
    } catch (error) {
      setRemoveError(
        error.response?.data?.message || "Failed to remove member.",
      );
    } finally {
      setRemoving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E6D4D7] border-t-[#7F2435]" />
          <p className="text-sm text-[#68746E]">Loading team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#7F2435]">Workspace</p>

          <h1 className="mt-1 text-3xl font-semibold text-[#18211D]">Team</h1>

          <p className="mt-2 text-sm text-[#68746E]">
            Manage your workspace members and their roles.
          </p>
        </div>

        {canManageMembers && (
          <button
            type="button"
            onClick={openAddModal}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#7F2435] px-4 text-sm font-medium text-white transition hover:bg-[#681D2C] focus:outline-none focus:ring-2 focus:ring-[#D9B8BE] focus:ring-offset-2"
          >
            <Plus size={17} />
            Add Member
          </button>
        )}
      </div>

      {}
      {error && (
        <div className="mt-6 flex items-start justify-between gap-4 border border-[#E8C9C7] bg-[#F8ECEB] p-4">
          <p className="text-sm text-[#8A2638]">{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-[#8A2638] transition hover:text-[#681D2C]"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {}
      {workspaces.length > 0 && (
        <div className="mt-6 border border-[#DDE3DF] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#89938E]">
                Current workspace
              </p>

              <p className="mt-1 text-sm font-semibold text-[#18211D]">
                {selectedWorkspace?.name || "Workspace"}
              </p>
            </div>

            {workspaces.length > 1 && (
              <select
                value={selectedWorkspaceId}
                onChange={(event) => setSelectedWorkspaceId(event.target.value)}
                className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none transition focus:border-[#7F2435] focus:ring-2 focus:ring-[#E8D3D7] sm:w-64"
              >
                {workspaces.map((workspace) => (
                  <option key={workspace._id} value={workspace._id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {}
      {selectedWorkspace && (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Total members"
            value={members.length}
            icon={<Users size={18} />}
          />

          <StatCard
            label="Admins"
            value={members.filter((member) => member.role === "admin").length}
            icon={<ShieldCheck size={18} />}
          />

          <StatCard
            label="Managers"
            value={members.filter((member) => member.role === "manager").length}
            icon={<BriefcaseBusiness size={18} />}
          />
        </div>
      )}

      {}
      {selectedWorkspace ? (
        <section className="mt-6 overflow-hidden border border-[#DDE3DF] bg-white shadow-sm">
          <div className="border-b border-[#E7EBE8] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3E5E8] text-[#7F2435]">
                    <Users size={16} />
                  </div>

                  <h2 className="text-lg font-semibold text-[#18211D]">
                    Members
                  </h2>
                </div>

                <p className="mt-2 text-sm text-[#68746E]">
                  {members.length} {members.length === 1 ? "member" : "members"}{" "}
                  in this workspace.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#89938E]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search members..."
                  className="h-9 w-full rounded-lg border border-[#D6DDD8] bg-white pl-9 pr-3 text-xs text-[#18211D] outline-none placeholder:text-[#9AA49F] transition focus:border-[#7F2435] focus:ring-2 focus:ring-[#E8D3D7]"
                />
              </div>
            </div>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="p-10 text-center">
              <Users size={30} className="mx-auto text-[#7F2435]" />

              <h3 className="mt-4 text-base font-semibold text-[#18211D]">
                No members found
              </h3>

              <p className="mt-2 text-sm text-[#68746E]">
                {members.length === 0
                  ? "This workspace has no members."
                  : "Try changing your search."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E7EBE8]">
              {filteredMembers.map((member) => {
                const memberUser =
                  typeof member.user === "object" ? member.user : null;

                const memberId = getId(member.user);
                const isCurrentUser = memberId === user?._id;
                const isOwner = member.role === "owner";

                return (
                  <div
                    key={memberId}
                    className="flex flex-col gap-4 p-5 transition hover:bg-[#FCFAFA] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F3E5E8] text-sm font-semibold text-[#7F2435]">
                        {memberUser?.avatar ? (
                          <img
                            src={memberUser.avatar}
                            alt={memberUser.name || "Member"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          memberUser?.name?.charAt(0)?.toUpperCase() || "U"
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-[#18211D]">
                            {memberUser?.name || "Unknown user"}
                          </p>

                          {isCurrentUser && (
                            <span className="rounded-full bg-[#F3E5E8] px-2 py-0.5 text-[10px] font-medium text-[#7F2435]">
                              You
                            </span>
                          )}
                        </div>

                        <p className="mt-1 truncate text-xs text-[#89938E]">
                          {memberUser?.email || "No email available"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <RoleBadge role={member.role} />

                      {canManageMembers && !isOwner && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openRoleModal(member)}
                            className="flex h-9 items-center gap-2 rounded-lg border border-[#D6DDD8] bg-[#F7F8F6] px-3 text-xs font-medium text-[#18211D] transition hover:border-[#D9B8BE] hover:bg-[#F3E5E8] hover:text-[#7F2435]"
                          >
                            <Pencil size={14} />
                            Role
                          </button>

                          <button
                            type="button"
                            onClick={() => openRemoveModal(member)}
                            className="flex h-9 items-center gap-2 rounded-lg border border-[#E1C7C5] bg-[#FBF3F2] px-3 text-xs font-medium text-[#8A2638] transition hover:bg-[#F8ECEB]"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <div className="mt-6 border border-[#DDE3DF] bg-white p-10 text-center shadow-sm">
          <Users size={30} className="mx-auto text-[#7F2435]" />

          <h2 className="mt-4 text-lg font-semibold text-[#18211D]">
            No workspace found
          </h2>

          <p className="mt-2 text-sm text-[#68746E]">
            Create or join a workspace to manage your team.
          </p>
        </div>
      )}

      {}
      {showAddModal && (
        <Modal
          title="Add Member"
          description="Add an existing user to this workspace."
          onClose={closeAddModal}
          disabled={saving}
        >
          <form onSubmit={handleAddMember} className="space-y-4">
            {formError && <ErrorBox message={formError} />}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#18211D]">
                Email
              </label>

              <input
                name="email"
                type="email"
                value={memberForm.email}
                onChange={handleMemberFormChange}
                placeholder="Enter user's email address"
                disabled={saving}
                autoComplete="off"
                className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none placeholder:text-[#9AA49F] transition focus:border-[#7F2435] focus:ring-2 focus:ring-[#E8D3D7] disabled:bg-[#F7F8F6]"
              />

              <p className="mt-1.5 text-xs text-[#89938E]">
                The user must already have a TaskFlow account.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#18211D]">
                Role
              </label>

              <select
                name="role"
                value={memberForm.role}
                onChange={handleMemberFormChange}
                disabled={saving}
                className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none transition focus:border-[#7F2435] focus:ring-2 focus:ring-[#E8D3D7]"
              >
                <option value="member">Member</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <ModalActions
              onCancel={closeAddModal}
              loading={saving}
              submitText="Add Member"
              loadingText="Adding..."
            />
          </form>
        </Modal>
      )}

      {}
      {showRoleModal && selectedMember && (
        <Modal
          title="Change Member Role"
          description="Update this member's workspace role."
          onClose={closeRoleModal}
          disabled={saving}
        >
          <form onSubmit={handleUpdateRole} className="space-y-4">
            {formError && <ErrorBox message={formError} />}

            <div className="flex items-center gap-3 border border-[#E1E5E2] bg-[#F7F8F6] p-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-[#F3E5E8] text-sm font-semibold text-[#7F2435]">
                {getMemberAvatar(selectedMember) ? (
                  <img
                    src={getMemberAvatar(selectedMember)}
                    alt={getMemberName(selectedMember)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getMemberName(selectedMember).charAt(0).toUpperCase()
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#18211D]">
                  {getMemberName(selectedMember)}
                </p>

                <p className="mt-1 truncate text-xs text-[#89938E]">
                  {getMemberEmail(selectedMember)}
                </p>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#18211D]">
                Role
              </label>

              <select
                name="role"
                value={memberForm.role}
                onChange={handleMemberFormChange}
                disabled={saving}
                className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none transition focus:border-[#7F2435] focus:ring-2 focus:ring-[#E8D3D7]"
              >
                <option value="member">Member</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <ModalActions
              onCancel={closeRoleModal}
              loading={saving}
              submitText="Save Role"
              loadingText="Saving..."
            />
          </form>
        </Modal>
      )}

      {}
      {showRemoveModal && selectedMember && (
        <Modal
          title="Remove Member"
          description="This member will lose access to this workspace."
          onClose={closeRemoveModal}
          disabled={removing}
        >
          <div>
            {removeError && <ErrorBox message={removeError} />}

            <p className="text-sm leading-6 text-[#68746E]">
              Are you sure you want to remove{" "}
              <span className="font-medium text-[#18211D]">
                {getMemberName(selectedMember)}
              </span>{" "}
              from this workspace?
            </p>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 border-t border-[#E7EBE8] pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeRemoveModal}
              disabled={removing}
              className="h-10 rounded-lg border border-[#D6DDD8] bg-[#F7F8F6] px-4 text-sm font-medium text-[#18211D] transition hover:bg-[#F3E5E8] hover:text-[#7F2435] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleRemoveMember}
              disabled={removing}
              className="h-10 rounded-lg bg-[#7F2435] px-4 text-sm font-medium text-white transition hover:bg-[#681D2C] disabled:opacity-60"
            >
              {removing ? "Removing..." : "Remove Member"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

const Modal = ({ title, description, onClose, disabled, children }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-md overflow-hidden rounded-xl border border-[#DDE3DF] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E1E5E2] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#18211D]">{title}</h2>

            <p className="mt-1 text-xs text-[#68746E]">{description}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={disabled}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#68746E] transition hover:bg-[#F3E5E8] hover:text-[#7F2435] disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

const ModalActions = ({ onCancel, loading, submitText, loadingText }) => {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-[#E7EBE8] pt-4 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="h-10 rounded-lg border border-[#D6DDD8] bg-[#F7F8F6] px-4 text-sm font-medium text-[#18211D] transition hover:bg-[#F3E5E8] hover:text-[#7F2435] disabled:opacity-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={loading}
        className="h-10 rounded-lg bg-[#7F2435] px-4 text-sm font-medium text-white transition hover:bg-[#681D2C] disabled:opacity-60"
      >
        {loading ? loadingText : submitText}
      </button>
    </div>
  );
};

const ErrorBox = ({ message }) => {
  return (
    <div className="border border-[#E8C9C7] bg-[#F8ECEB] p-3">
      <p className="text-sm text-[#8A2638]">{message}</p>
    </div>
  );
};

const StatCard = ({ label, value, icon }) => {
  return (
    <div className="border border-[#DDE3DF] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#89938E]">{label}</span>

        <span className="text-[#7F2435]">{icon}</span>
      </div>

      <p className="mt-3 text-2xl font-semibold text-[#18211D]">{value}</p>
    </div>
  );
};

const RoleBadge = ({ role }) => {
  const config = {
    owner: {
      label: "Owner",
      icon: <Crown size={13} />,
      className: "bg-[#F5E9E1] text-[#79552F]",
    },

    admin: {
      label: "Admin",
      icon: <ShieldCheck size={13} />,
      className: "bg-[#F3E5E8] text-[#7F2435]",
    },

    manager: {
      label: "Manager",
      icon: <BriefcaseBusiness size={13} />,
      className: "bg-[#F3E5E8] text-[#7F2435]",
    },

    member: {
      label: "Member",
      icon: <UserRound size={13} />,
      className: "bg-[#F4F6F2] text-[#68746E]",
    },
  };

  const item = config[role] || config.member;

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${item.className}`}
    >
      {item.icon}
      {item.label}
    </span>
  );
};

const getId = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "object" && value._id) {
    return value._id;
  }

  return value;
};

const getMemberName = (member) => {
  if (typeof member?.user === "object") {
    return member.user.name || "Unknown user";
  }

  return "Unknown user";
};

const getMemberEmail = (member) => {
  if (typeof member?.user === "object") {
    return member.user.email || "No email available";
  }

  return "No email available";
};

const getMemberAvatar = (member) => {
  if (typeof member?.user === "object") {
    return member.user.avatar || "";
  }

  return "";
};

export default Team;
