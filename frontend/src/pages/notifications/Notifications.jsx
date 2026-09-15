import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  UserPlus,
  CheckSquare,
  FolderKanban,
  Users,
  MessageSquare,
  AlertCircle,
  Info,
} from "lucide-react";

import api from "../../services/api";

const Notifications = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [unreadOnly, setUnreadOnly] = useState(
    searchParams.get("unreadOnly") === "true",
  );

  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [actionLoading, setActionLoading] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/notifications", {
        params: {
          page,
          limit: 20,
          unreadOnly,
        },
      });

      const data = response.data.data;

      setNotifications(data?.notifications || []);

      setPagination(
        data?.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      );
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to load notifications.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, unreadOnly]);

  const filteredNotifications = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return notifications;
    }

    return notifications.filter((notification) => {
      const title = notification.title?.toLowerCase() || "";

      const message = notification.message?.toLowerCase() || "";

      const sender = notification.sender?.name?.toLowerCase() || "";

      const type = notification.type?.toLowerCase() || "";

      const task = notification.relatedTask?.title?.toLowerCase() || "";

      const project = notification.relatedProject?.name?.toLowerCase() || "";

      return (
        title.includes(value) ||
        message.includes(value) ||
        sender.includes(value) ||
        type.includes(value) ||
        task.includes(value) ||
        project.includes(value)
      );
    });
  }, [notifications, search]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      setActionLoading(`read-${notificationId}`);

      await api.patch(`/notifications/${notificationId}/read`);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true,
                readAt: new Date().toISOString(),
              }
            : notification,
        ),
      );

      window.dispatchEvent(new Event("taskflow-notifications-changed"));
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to mark notification as read.",
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading("mark-all");

      await api.patch("/notifications/read-all");

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt || new Date().toISOString(),
        })),
      );

      window.dispatchEvent(new Event("taskflow-notifications-changed"));
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to mark all notifications as read.",
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleDelete = async (notificationId) => {
    const confirmed = window.confirm("Delete this notification?");

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(`delete-${notificationId}`);

      await api.delete(`/notifications/${notificationId}`);

      setNotifications((previous) =>
        previous.filter((notification) => notification._id !== notificationId),
      );

      setPagination((previous) => ({
        ...previous,
        total: Math.max(previous.total - 1, 0),
      }));

      window.dispatchEvent(new Event("taskflow-notifications-changed"));
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to delete notification.",
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleUnreadFilter = (value) => {
    setUnreadOnly(value);
    setPage(1);

    setSearchParams({
      unreadOnly: value ? "true" : "false",
      page: "1",
    });
  };

  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) {
      return;
    }

    setPage(newPage);

    setSearchParams({
      unreadOnly: unreadOnly ? "true" : "false",
      page: String(newPage),
    });
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-[#68746E]">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-[#68746E]">Updates</p>

          <h1 className="mt-1 text-3xl font-semibold text-[#18211D]">
            Notifications
          </h1>

          <p className="mt-2 text-sm text-[#68746E]">
            Stay up to date with your team and workspace activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={fetchNotifications}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#D6DDD8] bg-[#F7F8F6] px-4 text-sm font-medium text-[#18211D] transition hover:border-[#BFD8C7] hover:bg-[#EAF1EC] hover:text-[#315C4B]"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={actionLoading === "mark-all"}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#315C4B] px-4 text-sm font-medium text-white transition hover:bg-[#274D3F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCheck size={16} />

              {actionLoading === "mark-all" ? "Updating..." : "Mark all read"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-6 flex items-start justify-between gap-4 border border-[#E8C9C7] bg-[#F8ECEB] p-4">
          <div className="flex items-start gap-2">
            <AlertCircle size={17} className="mt-0.5 shrink-0 text-[#8A2638]" />

            <p className="text-sm text-[#8A2638]">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-[#8A2638]"
            aria-label="Close error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <StatCard
          icon={<Bell size={19} />}
          label="Notifications"
          value={pagination.total}
        />

        <StatCard
          icon={<Info size={19} />}
          label="Unread on this page"
          value={unreadCount}
        />
      </div>

      <div className="mt-6 border border-[#DDE3DF] bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#89938E]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search notifications..."
              className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white pl-10 pr-3 text-sm text-[#18211D] outline-none placeholder:text-[#9AA49F] focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
            />
          </div>

          <button
            type="button"
            onClick={() => handleUnreadFilter(!unreadOnly)}
            className={`flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition ${
              unreadOnly
                ? "border-[#315C4B] bg-[#EAF1EC] text-[#315C4B]"
                : "border-[#D6DDD8] bg-[#F7F8F6] text-[#18211D] hover:border-[#BFD8C7] hover:bg-[#EAF1EC] hover:text-[#315C4B]"
            }`}
          >
            <Check size={16} />

            {unreadOnly ? "Showing unread" : "Unread only"}
          </button>
        </div>
      </div>

      <section className="mt-6 border border-[#DDE3DF] bg-white">
        <div className="border-b border-[#E7EBE8] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#18211D]">
                Your Notifications
              </h2>

              <p className="mt-1 text-sm text-[#68746E]">
                {filteredNotifications.length === 0
                  ? "No notifications to show"
                  : `${filteredNotifications.length} shown on this page`}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF1EC] text-[#315C4B]">
              <Bell size={18} />
            </div>
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <EmptyState unreadOnly={unreadOnly} search={search} />
        ) : (
          <div className="divide-y divide-[#E7EBE8]">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                actionLoading={actionLoading}
              />
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
              className="flex h-9 items-center gap-1.5 rounded-lg border border-[#D6DDD8] bg-white px-3 text-xs font-medium text-[#18211D] transition hover:bg-[#EAF1EC] hover:text-[#315C4B] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={15} />
              Previous
            </button>

            <button
              type="button"
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-[#D6DDD8] bg-white px-3 text-xs font-medium text-[#18211D] transition hover:bg-[#EAF1EC] hover:text-[#315C4B] disabled:cursor-not-allowed disabled:opacity-40"
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

const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
  actionLoading,
}) => {
  const sender = notification.sender || null;

  const task = notification.relatedTask || null;

  const project = notification.relatedProject || null;

  const typeConfig = getNotificationType(notification.type);

  return (
    <div
      className={`relative p-5 transition ${
        notification.isRead
          ? "bg-white hover:bg-[#FAFBFA]"
          : "bg-[#F7FAF7] hover:bg-[#F2F7F3]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${typeConfig.bg} ${typeConfig.text}`}
        >
          {typeConfig.icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  className={`text-sm ${
                    notification.isRead ? "font-medium" : "font-semibold"
                  } text-[#18211D]`}
                >
                  {notification.title || "Notification"}
                </h3>

                {!notification.isRead && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#8A2638]" />
                )}
              </div>

              <p className="mt-1 text-sm leading-6 text-[#68746E]">
                {notification.message || "You have a new notification."}
              </p>
            </div>

            <span className="shrink-0 text-xs text-[#89938E]">
              {formatDateTime(notification.createdAt)}
            </span>
          </div>

          {sender && (
            <div className="mt-3 flex items-center gap-2 text-xs text-[#68746E]">
              <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-md bg-[#DCEBDF] font-medium text-[#315C4B]">
                {sender.avatar ? (
                  <img
                    src={sender.avatar}
                    alt={sender.name || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  sender.name?.charAt(0)?.toUpperCase() || "U"
                )}
              </div>

              <span>
                From{" "}
                <span className="font-medium text-[#18211D]">
                  {sender.name || "Team member"}
                </span>
              </span>
            </div>
          )}

          {(task || project) && (
            <div className="mt-3 flex flex-wrap gap-2">
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
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {!notification.isRead && (
              <button
                type="button"
                onClick={() => onMarkAsRead(notification._id)}
                disabled={actionLoading === `read-${notification._id}`}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-[#315C4B] px-3 text-xs font-medium text-white transition hover:bg-[#274D3F] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Check size={14} />

                {actionLoading === `read-${notification._id}`
                  ? "Updating..."
                  : "Mark as read"}
              </button>
            )}

            <button
              type="button"
              onClick={() => onDelete(notification._id)}
              disabled={actionLoading === `delete-${notification._id}`}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-[#D6DDD8] bg-white px-3 text-xs font-medium text-[#68746E] transition hover:border-[#E8C9C7] hover:bg-[#FBF3F2] hover:text-[#8A2638] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 size={14} />

              {actionLoading === `delete-${notification._id}`
                ? "Deleting..."
                : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => {
  return (
    <div className="border border-[#DDE3DF] bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#89938E]">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold text-[#18211D]">{value}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF1EC] text-[#315C4B]">
          {icon}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ unreadOnly, search }) => {
  let message = "You don't have any notifications yet.";

  if (unreadOnly) {
    message = "You don't have any unread notifications.";
  }

  if (search) {
    message = "No notifications match your search.";
  }

  return (
    <div className="p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[#EAF1EC] text-[#315C4B]">
        <Bell size={22} />
      </div>

      <h3 className="mt-4 text-base font-semibold text-[#18211D]">
        Nothing here
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-[#68746E]">{message}</p>
    </div>
  );
};

const getNotificationType = (type) => {
  const configs = {
    task_assigned: {
      icon: <UserPlus size={19} />,
      bg: "bg-[#EAF1EC]",
      text: "text-[#315C4B]",
    },

    task_created: {
      icon: <CheckSquare size={19} />,
      bg: "bg-[#EAF1EC]",
      text: "text-[#315C4B]",
    },

    task_updated: {
      icon: <CheckSquare size={19} />,
      bg: "bg-[#F4F6F2]",
      text: "text-[#68746E]",
    },

    project_updated: {
      icon: <FolderKanban size={19} />,
      bg: "bg-[#EAF1EC]",
      text: "text-[#315C4B]",
    },

    workspace_invite: {
      icon: <Users size={19} />,
      bg: "bg-[#EAF1EC]",
      text: "text-[#315C4B]",
    },

    "comment-added": {
      icon: <MessageSquare size={19} />,
      bg: "bg-[#F4F6F2]",
      text: "text-[#68746E]",
    },
  };

  return (
    configs[type] || {
      icon: <Bell size={19} />,
      bg: "bg-[#EAF1EC]",
      text: "text-[#315C4B]",
    }
  );
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

export default Notifications;
