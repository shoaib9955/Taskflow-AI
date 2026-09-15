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
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();

  const location = useLocation();

  const { logout } = useAuth();

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
          lg:sticky lg:top-0 lg:z-auto
          lg:flex lg:h-screen
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >

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
