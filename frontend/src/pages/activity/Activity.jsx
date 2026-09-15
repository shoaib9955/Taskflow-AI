import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Activity as ActivityIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  FolderKanban,
  CheckSquare,
  Clock3,
  Plus,
  Pencil,
  Trash2,
  UserPlus,
  RefreshCw,
  MessageSquare,
  Paperclip,
  Filter,
  X,
} from "lucide-react";

import api from "../../services/api";

const Activity = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [activities, setActivities] = useState([]);

  const [workspaces, setWorkspaces] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [workspaceFilter, setWorkspaceFilter] = useState(
    searchParams.get("workspace") || "",
  );

  const [projectFilter, setProjectFilter] = useState(
    searchParams.get("project") || "",
  );

  const [taskFilter, setTaskFilter] = useState(searchParams.get("task") || "");

  const [userFilter, setUserFilter] = useState(searchParams.get("user") || "");

  const [search, setSearch] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  const fetchWorkspaces = async () => {
    try {
      const response = await api.get("/workspaces");

      const data = response.data.data;

      setWorkspaces(data?.workspaces || data || []);
    } catch (error) {
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: 20,
      };

      if (workspaceFilter) {
        params.workspace = workspaceFilter;
      }

      if (projectFilter) {
        params.project = projectFilter;
      }

      if (taskFilter) {
        params.task = taskFilter;
      }

      if (userFilter) {
        params.user = userFilter;
      }

      const response = await api.get("/activities", { params });

      const data = response.data.data;

      setActivities(data?.activities || []);

      setPagination(
        data?.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      );
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load activity.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [page, workspaceFilter, projectFilter, taskFilter, userFilter]);

  const filteredActivities = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return activities;
    }

    return activities.filter((activity) => {
      const description = activity.description?.toLowerCase() || "";

      const action = activity.action?.toLowerCase() || "";

      const userName = activity.user?.name?.toLowerCase() || "";

      const projectName = activity.project?.name?.toLowerCase() || "";

      const taskTitle = activity.task?.title?.toLowerCase() || "";

      return (
        description.includes(value) ||
        action.includes(value) ||
        userName.includes(value) ||
        projectName.includes(value) ||
        taskTitle.includes(value)
      );
    });
  }, [activities, search]);

  const applyFilters = () => {
    setPage(1);

    const params = {};

    if (workspaceFilter) {
      params.workspace = workspaceFilter;
    }

    if (projectFilter) {
      params.project = projectFilter;
    }

    if (taskFilter) {
      params.task = taskFilter;
    }

    if (userFilter) {
      params.user = userFilter;
    }

    params.page = 1;

    setSearchParams(params);
  };

  const clearFilters = () => {
    setWorkspaceFilter("");
    setProjectFilter("");
    setTaskFilter("");
    setUserFilter("");
    setSearch("");
    setPage(1);
    setSearchParams({});
  };

  const hasFilters = Boolean(
    workspaceFilter || projectFilter || taskFilter || userFilter,
  );

  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) {
      return;
    }

    setPage(newPage);

    const params = {};

    if (workspaceFilter) {
      params.workspace = workspaceFilter;
    }

    if (projectFilter) {
      params.project = projectFilter;
    }

    if (taskFilter) {
      params.task = taskFilter;
    }

    if (userFilter) {
      params.user = userFilter;
    }

    params.page = newPage;

    setSearchParams(params);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-[#68746E]">Loading activity...</p>
      </div>
    );
  }

  return (
    <div className="w-full">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-[#68746E]">Workspace</p>

          <h1 className="mt-1 text-3xl font-semibold text-[#18211D]">
            Activity
          </h1>

          <p className="mt-2 text-sm text-[#68746E]">
            Keep track of what's happening across your workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchActivities}
          className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#D6DDD8] bg-[#F7F8F6] px-4 text-sm font-medium text-[#18211D] transition hover:border-[#BFD8C7] hover:bg-[#EAF1EC] hover:text-[#315C4B]"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mt-6 flex items-start justify-between gap-4 border border-[#E8C9C7] bg-[#F8ECEB] p-4">
          <p className="text-sm text-[#8A2638]">{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-[#8A2638]"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <div className="mt-6 border border-[#DDE3DF] bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#89938E]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search activity..."
              className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white pl-10 pr-3 text-sm text-[#18211D] outline-none placeholder:text-[#9AA49F] focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((previous) => !previous)}
            className={`flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition ${
              showFilters || hasFilters
                ? "border-[#315C4B] bg-[#EAF1EC] text-[#315C4B]"
                : "border-[#D6DDD8] bg-[#F7F8F6] text-[#18211D] hover:border-[#BFD8C7] hover:bg-[#EAF1EC] hover:text-[#315C4B]"
            }`}
          >
            <Filter size={16} />
            Filters
            {hasFilters && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#315C4B] px-1 text-[10px] text-white">
                {
                  [
                    workspaceFilter,
                    projectFilter,
                    taskFilter,
                    userFilter,
                  ].filter(Boolean).length
                }
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 border-t border-[#E7EBE8] pt-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#68746E]">
                  Workspace
                </label>

                <select
                  value={workspaceFilter}
                  onChange={(event) => setWorkspaceFilter(event.target.value)}
                  className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
                >
                  <option value="">All workspaces</option>

                  {workspaces.map((workspace) => (
                    <option key={workspace._id} value={workspace._id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#68746E]">
                  Project ID
                </label>

                <input
                  type="text"
                  value={projectFilter}
                  onChange={(event) => setProjectFilter(event.target.value)}
                  placeholder="Optional project ID"
                  className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none placeholder:text-[#9AA49F] focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#68746E]">
                  Task ID
                </label>

                <input
                  type="text"
                  value={taskFilter}
                  onChange={(event) => setTaskFilter(event.target.value)}
                  placeholder="Optional task ID"
                  className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none placeholder:text-[#9AA49F] focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#68746E]">
                  User ID
                </label>

                <input
                  type="text"
                  value={userFilter}
                  onChange={(event) => setUserFilter(event.target.value)}
                  placeholder="Optional user ID"
                  className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none placeholder:text-[#9AA49F] focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-10 rounded-lg border border-[#D6DDD8] bg-[#F7F8F6] px-4 text-sm font-medium text-[#18211D] hover:bg-[#EAF1EC]"
                >
                  Clear Filters
                </button>
              )}

              <button
                type="button"
                onClick={applyFilters}
                className="h-10 rounded-lg bg-[#315C4B] px-4 text-sm font-medium text-white hover:bg-[#274D3F]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <section className="mt-6 border border-[#DDE3DF] bg-white">
        <div className="border-b border-[#E7EBE8] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#18211D]">
                Recent Activity
              </h2>

              <p className="mt-1 text-sm text-[#68746E]">
                {pagination.total} total activities
              </p>
            </div>

            <ActivityIcon size={20} className="text-[#315C4B]" />
          </div>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="p-10 text-center">
            <ActivityIcon size={30} className="mx-auto text-[#315C4B]" />

            <h3 className="mt-4 text-base font-semibold text-[#18211D]">
              No activity found
            </h3>

            <p className="mt-2 text-sm text-[#68746E]">
              {search
                ? "Try changing your search."
                : "Activity will appear here as your team works."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E7EBE8]">
            {filteredActivities.map((activity) => (
              <ActivityItem key={activity._id} activity={activity} />
            ))}
          </div>
        )}
      </section>

      {pagination.totalPages > 1 && (
        <div className="mt-5 flex flex-col gap-3 border border-[#DDE3DF] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#68746E]">
            Page{" "}
            <span className="font-medium text-[#18211D]">
              {pagination.page}
            </span>{" "}
            of{" "}
            <span className="font-medium text-[#18211D]">
              {pagination.totalPages}
            </span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-[#D6DDD8] bg-white px-3 text-xs font-medium text-[#18211D] hover:bg-[#EAF1EC] hover:text-[#315C4B] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={15} />
              Previous
            </button>

            <button
              type="button"
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-[#D6DDD8] bg-white px-3 text-xs font-medium text-[#18211D] hover:bg-[#EAF1EC] hover:text-[#315C4B] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ActivityItem = ({ activity }) => {
  const user = activity.user || null;

  const project = activity.project || null;

  const task = activity.task || null;

  return (
    <div className="p-5 transition hover:bg-[#FAFBFA]">
      <div className="flex items-start gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#DCEBDF] text-sm font-semibold text-[#315C4B]">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || "User"}
              className="h-full w-full object-cover"
            />
          ) : (
            user?.name?.charAt(0)?.toUpperCase() || "U"
          )}
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm leading-6 text-[#18211D]">
                {user?.name || "Someone"}{" "}
                <span className="text-[#68746E]">
                  {activity.description || formatAction(activity.action)}
                </span>
              </p>
            </div>

            <span className="shrink-0 text-xs text-[#89938E]">
              {formatDateTime(activity.createdAt)}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {project && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF1EC] px-2.5 py-1 text-xs font-medium text-[#315C4B]">
                <FolderKanban size={12} />

                {project.name}
              </span>
            )}

            {task && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F6F2] px-2.5 py-1 text-xs font-medium text-[#68746E]">
                <CheckSquare size={12} />

                {task.title}
              </span>
            )}

            <ActionBadge action={activity.action} />
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionBadge = ({ action }) => {
  const config = {
    created: {
      icon: <Plus size={12} />,
      className: "bg-[#E4F0E7] text-[#315C4B]",
    },

    updated: {
      icon: <Pencil size={12} />,
      className: "bg-[#EAF1EC] text-[#315C4B]",
    },

    deleted: {
      icon: <Trash2 size={12} />,
      className: "bg-[#FBF3F2] text-[#8A2638]",
    },

    assigned: {
      icon: <UserPlus size={12} />,
      className: "bg-[#EAF1EC] text-[#315C4B]",
    },

    "status-changed": {
      icon: <RefreshCw size={12} />,
      className: "bg-[#EAF1EC] text-[#315C4B]",
    },

    commented: {
      icon: <MessageSquare size={12} />,
      className: "bg-[#F4F6F2] text-[#68746E]",
    },

    "attachment-added": {
      icon: <Paperclip size={12} />,
      className: "bg-[#F4F6F2] text-[#68746E]",
    },
  };

  const item = config[action] || config.updated;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${item.className}`}
    >
      {item.icon}

      {formatLabel(action)}
    </span>
  );
};

const formatAction = (action) => {
  if (!action) {
    return "performed an action";
  }

  return `performed ${formatLabel(action)}`;
};

const formatLabel = (value) => {
  if (!value) {
    return "Unknown";
  }

  return String(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDateTime = (date) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default Activity;
