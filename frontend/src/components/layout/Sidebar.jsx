import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Activity,
  Bell,
  Sparkles,
  Settings,
  LogOut,
  Leaf,
  X,
  HelpCircle,
  ChevronDown,
  Plus,
} from "lucide-react";

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useWorkspace } from "../../context/WorkspaceContext";

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { logout } = useAuth();

  const { workspaces, currentWorkspace, selectWorkspace, createWorkspace } =
    useWorkspace();

  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);

  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);

  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");

  const [creatingWorkspace, setCreatingWorkspace] = useState(false);

  const [workspaceError, setWorkspaceError] = useState("");

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    closeMobileSidebar();
  };

  const handleLogout = async () => {
    closeMobileSidebar();

    await logout();

    navigate("/login", {
      replace: true,
    });
  };

  const handleWorkspaceSelect = (workspace) => {
    selectWorkspace(workspace);
    setWorkspaceMenuOpen(false);
  };

  const openCreateWorkspace = () => {
    setWorkspaceMenuOpen(false);
    setWorkspaceError("");
    setWorkspaceName("");
    setWorkspaceDescription("");
    setCreateWorkspaceOpen(true);
  };

  const closeCreateWorkspace = () => {
    if (creatingWorkspace) {
      return;
    }

    setCreateWorkspaceOpen(false);
    setWorkspaceError("");
  };

  const handleCreateWorkspace = async (event) => {
    event.preventDefault();

    const name = workspaceName.trim();
    const description = workspaceDescription.trim();

    if (!name) {
      setWorkspaceError("Workspace name is required.");
      return;
    }

    if (name.length < 2) {
      setWorkspaceError("Workspace name must be at least 2 characters.");
      return;
    }

    try {
      setCreatingWorkspace(true);
      setWorkspaceError("");

      await createWorkspace({
        name,
        description,
      });

      setCreateWorkspaceOpen(false);
      setWorkspaceName("");
      setWorkspaceDescription("");
    } catch (error) {
      setWorkspaceError(
        error.response?.data?.message ||
          "Failed to create workspace. Please try again.",
      );
    } finally {
      setCreatingWorkspace(false);
    }
  };

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-screen w-64 shrink-0 flex-col
          bg-[#18211D] text-white
          transition-transform duration-300
          lg:sticky lg:top-0 lg:z-50
          lg:flex lg:h-screen
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <button
            type="button"
            onClick={() => handleNavigation("/dashboard")}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#315C4B]">
              <Leaf size={21} />
            </div>

            <div>
              <h1 className="text-lg font-semibold">TaskFlow</h1>

              <p className="text-xs text-[#8F9B95]">Team workspace</p>
            </div>
          </button>

          <button
            type="button"
            onClick={closeMobileSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#AAB6B0] transition hover:bg-[#8A2638] hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        </div>

        {}
        <div className="border-b border-white/10 px-4 py-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => setWorkspaceMenuOpen((previous) => !previous)}
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left transition hover:bg-white/10"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#315C4B] text-sm font-semibold">
                {currentWorkspace?.name?.charAt(0)?.toUpperCase() || "W"}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {currentWorkspace?.name || "Select workspace"}
                </p>

                <p className="text-xs text-[#8F9B95]">Workspace</p>
              </div>

              <ChevronDown
                size={17}
                className={`shrink-0 text-[#8F9B95] transition ${
                  workspaceMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {workspaceMenuOpen && (
              <div className="absolute left-0 right-0 top-full z-[70] mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#202B26] shadow-2xl">
                <div className="max-h-60 overflow-y-auto p-2">
                  {workspaces.length > 0 ? (
                    workspaces.map((workspace) => (
                      <button
                        key={workspace._id}
                        type="button"
                        onClick={() => handleWorkspaceSelect(workspace)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                          currentWorkspace?._id === workspace._id
                            ? "bg-[#315C4B] text-white"
                            : "text-[#AAB6B0] hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#315C4B] text-xs font-semibold">
                          {workspace.name?.charAt(0)?.toUpperCase() || "W"}
                        </div>

                        <span className="truncate text-sm">
                          {workspace.name}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-3 text-sm text-[#8F9B95]">
                      No workspaces yet.
                    </p>
                  )}
                </div>

                <div className="border-t border-white/10 p-2">
                  <button
                    type="button"
                    onClick={openCreateWorkspace}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#AAB6B0] transition hover:bg-[#8A2638] hover:text-white"
                  >
                    <Plus size={17} />
                    <span>Create Workspace</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#68746E]">
            Workspace
          </p>

          <div className="space-y-1">
            <SidebarItem
              icon={<LayoutDashboard size={18} />}
              label="Dashboard"
              active={isActive("/dashboard")}
              onClick={() => handleNavigation("/dashboard")}
            />

            <SidebarItem
              icon={<FolderKanban size={18} />}
              label="Projects"
              active={isActive("/projects")}
              onClick={() => handleNavigation("/projects")}
            />

            <SidebarItem
              icon={<CheckSquare size={18} />}
              label="My Tasks"
              active={isActive("/tasks")}
              onClick={() => handleNavigation("/tasks")}
            />

            <SidebarItem
              icon={<Users size={18} />}
              label="Team"
              active={isActive("/team")}
              onClick={() => handleNavigation("/team")}
            />

            <SidebarItem
              icon={<Activity size={18} />}
              label="Activity"
              active={isActive("/activity")}
              onClick={() => handleNavigation("/activity")}
            />

            <SidebarItem
              icon={<Bell size={18} />}
              label="Notifications"
              active={isActive("/notifications")}
              onClick={() => handleNavigation("/notifications")}
            />
          </div>

          <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#68746E]">
            Tools
          </p>

          <div className="space-y-1">
            <SidebarItem
              icon={<Sparkles size={18} />}
              label="AI Assistant"
              active={isActive("/ai")}
              onClick={() => handleNavigation("/ai")}
              activeClassName="bg-[#8A2638] text-white"
            />

            <SidebarItem
              icon={<HelpCircle size={18} />}
              label="Guide"
              active={isActive("/guide")}
              onClick={() => handleNavigation("/guide")}
              activeClassName="bg-[#8A2638] text-white"
            />
          </div>
        </nav>

        {}
        <div className="border-t border-white/10 p-4">
          <SidebarItem
            icon={<Settings size={18} />}
            label="Settings"
            active={isActive("/settings")}
            onClick={() => handleNavigation("/settings")}
          />

          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#AAB6B0] transition hover:bg-[#8A2638] hover:text-white"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {}
      {createWorkspaceOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !creatingWorkspace) {
              closeCreateWorkspace();
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Create Workspace
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Create a workspace for your team.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateWorkspace}
                disabled={creatingWorkspace}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-5 p-6">
              <div>
                <label
                  htmlFor="workspace-name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Workspace name
                </label>

                <input
                  id="workspace-name"
                  type="text"
                  value={workspaceName}
                  onChange={(event) => setWorkspaceName(event.target.value)}
                  placeholder="e.g. My Team"
                  maxLength={100}
                  autoFocus
                  disabled={creatingWorkspace}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#315C4B] focus:ring-2 focus:ring-[#315C4B]/20 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="workspace-description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Description
                  <span className="ml-1 font-normal text-gray-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="workspace-description"
                  value={workspaceDescription}
                  onChange={(event) =>
                    setWorkspaceDescription(event.target.value)
                  }
                  placeholder="What is this workspace for?"
                  maxLength={500}
                  rows={4}
                  disabled={creatingWorkspace}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#315C4B] focus:ring-2 focus:ring-[#315C4B]/20 disabled:bg-gray-100"
                />
              </div>

              {workspaceError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                  {workspaceError}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeCreateWorkspace}
                  disabled={creatingWorkspace}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingWorkspace}
                  className="rounded-lg bg-[#315C4B] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#264A3C] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingWorkspace ? "Creating..." : "Create Workspace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const SidebarItem = ({
  icon,
  label,
  active = false,
  onClick,
  activeClassName = "bg-[#315C4B] text-white",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex w-full items-center gap-3
        rounded-lg px-3 py-2.5
        text-sm transition
        ${
          active
            ? activeClassName
            : "text-[#AAB6B0] hover:bg-[#8A2638] hover:text-white"
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default Sidebar;
