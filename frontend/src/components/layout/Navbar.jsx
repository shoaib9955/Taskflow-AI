import { useEffect, useRef, useState } from "react";

import {
  Search,
  Bell,
  Plus,
  Menu,
  ChevronDown,
  CheckSquare,
  FolderKanban,
  Settings,
  LogOut,
  X,
  HelpCircle,
  Sparkles,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const Navbar = ({ setMobileOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const searchRef = useRef(null);
  const createRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }

      if (createRef.current && !createRef.current.contains(event.target)) {
        setCreateOpen(false);
      }

      if (userRef.current && !userRef.current.contains(event.target)) {
        setUserOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    setCreateOpen(false);
    setUserOpen(false);
  }, [location.pathname]);

  const closeAllMenus = () => {
    setSearchOpen(false);
    setCreateOpen(false);
    setUserOpen(false);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const query = searchValue.trim();

    if (!query) {
      return;
    }

    setSearchOpen(false);

    navigate(`/tasks?search=${encodeURIComponent(query)}`);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Escape") {
      setSearchOpen(false);
      setSearchValue("");
    }
  };

  const handleCreateTask = () => {
    setCreateOpen(false);
    navigate("/tasks");
  };

  const handleCreateProject = () => {
    setCreateOpen(false);
    navigate("/projects");
  };

  const handleGuide = () => {
    closeAllMenus();
    navigate("/guide");
  };

  const handleAI = () => {
    closeAllMenus();
    navigate("/ai");
  };

  const handleNotifications = () => {
    closeAllMenus();
    navigate("/notifications");
  };

  const handleSettings = () => {
    setUserOpen(false);
    navigate("/settings");
  };

  const handleLogout = async () => {
    setUserOpen(false);

    await logout();

    navigate("/login", {
      replace: true,
    });
  };

  const renderAvatar = (size = "small") => {
    const sizeClass =
      size === "large" ? "h-9 w-9 sm:h-10 sm:w-10 text-sm" : "h-8 w-8 text-sm";

    if (user?.avatar) {
      return (
        <img
          src={user.avatar}
          alt={user?.name || "Profile"}
          className={`${sizeClass} shrink-0 rounded-md object-cover`}
        />
      );
    }

    return (
      <div
        className={`flex shrink-0 ${sizeClass} items-center justify-center rounded-md bg-[#DCEBDF] font-semibold text-[#315C4B]`}
      >
        {user?.name?.charAt(0)?.toUpperCase() || "U"}
      </div>
    );
  };

  return (
    <header className="relative flex min-h-16 shrink-0 items-center justify-between gap-2 border-b border-[#E1E5E2] bg-white px-3 sm:min-h-20 sm:px-5 md:px-6 lg:px-8">
      {}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#68746E] transition hover:bg-[#8A2638] hover:text-white sm:h-10 sm:w-10 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <p className="hidden text-xs text-[#8A948F] xs:block sm:text-sm">
            Welcome back
          </p>

          <h1 className="max-w-[130px] truncate text-base font-semibold text-[#18211D] sm:max-w-[220px] sm:text-lg md:max-w-[280px]">
            {user?.name || "User"}
          </h1>
        </div>
      </div>

      {}
      <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
        {}
        <div ref={searchRef} className="relative hidden sm:block">
          {!searchOpen ? (
            <button
              type="button"
              onClick={() => {
                setSearchOpen(true);
                setCreateOpen(false);
                setUserOpen(false);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#DCE2DE] bg-[#F7F8F6] text-[#8A948F] transition hover:border-[#315C4B] hover:text-[#315C4B] md:w-auto md:gap-2 md:px-3"
              aria-label="Search"
            >
              <Search size={17} />

              <span className="hidden text-sm md:inline">Search</span>

              <kbd className="ml-2 hidden rounded border border-[#DCE2DE] bg-white px-1.5 py-0.5 text-[10px] text-[#68746E] lg:inline">
                /
              </kbd>
            </button>
          ) : (
            <form
              onSubmit={handleSearchSubmit}
              className="flex h-10 w-[min(280px,40vw)] min-w-[180px] items-center gap-2 rounded-lg border border-[#315C4B] bg-white px-3 shadow-sm"
            >
              <Search size={17} className="shrink-0 text-[#315C4B]" />

              <input
                autoFocus
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search tasks..."
                className="min-w-0 flex-1 bg-transparent text-sm text-[#18211D] outline-none placeholder:text-[#9AA49F]"
              />

              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchValue("");
                }}
                className="shrink-0 text-[#89938E] transition hover:text-[#8A2638]"
                aria-label="Close search"
              >
                <X size={16} />
              </button>
            </form>
          )}
        </div>

        {}
        <button
          type="button"
          onClick={() => {
            setSearchOpen(true);
            setCreateOpen(false);
            setUserOpen(false);
          }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#68746E] transition hover:bg-[#8A2638] hover:text-white sm:hidden"
          aria-label="Search"
        >
          <Search size={19} />
        </button>

        {}
        <button
          type="button"
          onClick={handleGuide}
          className="hidden h-10 items-center gap-2 rounded-lg bg-[#8A2638] px-3.5 text-sm font-medium text-white transition hover:bg-[#721F2F] md:flex"
        >
          <HelpCircle size={17} />
          <span>Guide</span>
        </button>

        {}
        <button
          type="button"
          onClick={handleAI}
          className="hidden h-10 items-center gap-2 rounded-lg border border-[#8A2638] bg-white px-3.5 text-sm font-medium text-[#8A2638] transition hover:bg-[#F8ECEB] md:flex"
        >
          <Sparkles size={17} />
          <span>AI Assistant</span>
        </button>

        {}
        <div ref={createRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setCreateOpen((previous) => !previous);
              setSearchOpen(false);
              setUserOpen(false);
            }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#315C4B] text-white transition hover:bg-[#274D3F] sm:h-10 sm:w-auto sm:gap-2 sm:px-3.5"
            aria-label="Create"
            aria-expanded={createOpen}
          >
            <Plus size={17} />

            <span className="hidden text-sm font-medium sm:inline">Create</span>

            <ChevronDown
              size={15}
              className={`hidden transition-transform sm:block ${
                createOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {createOpen && (
            <div className="absolute right-0 top-11 z-50 w-[min(224px,calc(100vw-1.5rem))] border border-[#DDE3DF] bg-white py-2 shadow-lg sm:top-12">
              <p className="px-4 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#89938E]">
                Create new
              </p>

              <button
                type="button"
                onClick={handleCreateTask}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#F4F7F4]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF1EC] text-[#315C4B]">
                  <CheckSquare size={17} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#18211D]">New task</p>
                  <p className="mt-0.5 text-xs text-[#89938E]">
                    Add a work item
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleCreateProject}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#F4F7F4]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F6E9EC] text-[#8A2638]">
                  <FolderKanban size={17} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#18211D]">
                    New project
                  </p>
                  <p className="mt-0.5 text-xs text-[#89938E]">
                    Start a new project
                  </p>
                </div>
              </button>
            </div>
          )}
        </div>

        {}
        <button
          type="button"
          onClick={handleNotifications}
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#68746E] transition hover:bg-[#8A2638] hover:text-white sm:h-10 sm:w-10"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-[#8A2638] sm:right-2.5 sm:top-2" />
        </button>

        {}
        <div ref={userRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setUserOpen((previous) => !previous);
              setCreateOpen(false);
              setSearchOpen(false);
            }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E1E5E2] bg-white px-0 transition hover:bg-[#F7F8F6] sm:h-10 sm:w-auto sm:gap-2 sm:px-2"
            aria-label="Open account menu"
            aria-expanded={userOpen}
          >
            {renderAvatar()}

            <div className="hidden min-w-0 text-left md:block">
              <p className="max-w-[110px] truncate text-xs font-medium text-[#18211D]">
                {user?.name || "User"}
              </p>

              <p className="text-[11px] text-[#8A948F]">Team member</p>
            </div>

            <ChevronDown
              size={15}
              className={`hidden shrink-0 text-[#89938E] transition-transform md:block ${
                userOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {userOpen && (
            <div className="absolute right-0 top-11 z-50 w-[min(256px,calc(100vw-1.5rem))] border border-[#DDE3DF] bg-white shadow-lg sm:top-12">
              <div className="border-b border-[#E7EBE8] p-4">
                <div className="flex min-w-0 items-center gap-3">
                  {renderAvatar("large")}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#18211D]">
                      {user?.name || "User"}
                    </p>

                    <p className="truncate text-xs text-[#89938E]">
                      {user?.email || "No email"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                {}
                <div className="mb-1 border-b border-[#E7EBE8] pb-1 md:hidden">
                  <button
                    type="button"
                    onClick={handleGuide}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-[#F8ECEB]"
                  >
                    <HelpCircle size={17} className="text-[#8A2638]" />
                    <span className="text-sm text-[#18211D]">Guide</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAI}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-[#F8ECEB]"
                  >
                    <Sparkles size={17} className="text-[#8A2638]" />
                    <span className="text-sm text-[#18211D]">AI Assistant</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSettings}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-[#F4F7F4]"
                >
                  <Settings size={17} className="text-[#68746E]" />
                  <span className="text-sm text-[#18211D]">Settings</span>
                </button>

                <button
                  type="button"
                  onClick={handleNotifications}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-[#F4F7F4]"
                >
                  <Bell size={17} className="text-[#68746E]" />
                  <span className="text-sm text-[#18211D]">Notifications</span>
                </button>
              </div>

              <div className="border-t border-[#E7EBE8] p-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[#8A2638] transition hover:bg-[#F8ECEB]"
                >
                  <LogOut size={17} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {}
      {searchOpen && (
        <div className="absolute left-0 right-0 top-16 z-40 border-b border-[#DDE3DF] bg-white p-3 shadow-md sm:hidden">
          <form
            onSubmit={handleSearchSubmit}
            className="flex h-11 items-center gap-2 border border-[#315C4B] bg-white px-3"
          >
            <Search size={18} className="shrink-0 text-[#315C4B]" />

            <input
              autoFocus
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search tasks..."
              className="min-w-0 flex-1 bg-transparent text-sm text-[#18211D] outline-none placeholder:text-[#9AA49F]"
            />

            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setSearchValue("");
              }}
              className="shrink-0 text-[#89938E] transition hover:text-[#8A2638]"
              aria-label="Close search"
            >
              <X size={17} />
            </button>
          </form>

          <p className="px-1 pt-2 text-xs text-[#89938E]">
            Search your tasks by title or keyword.
          </p>
        </div>
      )}
    </header>
  );
};

export default Navbar;
