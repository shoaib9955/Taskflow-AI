import { useEffect, useState } from "react";

import {
  FolderKanban,
  CheckSquare,
  CircleCheck,
  Clock3,
  ArrowRight,
  TrendingUp,
  BriefcaseBusiness,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import { useWorkspace } from "../../context/WorkspaceContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentWorkspace, loading: workspaceLoading } = useWorkspace();

  const [projects, setProjects] = useState([]);

  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    if (workspaceLoading || !currentWorkspace?._id) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [projectsResponse, tasksResponse] = await Promise.all([
        api.get("/projects", {
          params: {
            workspace: currentWorkspace._id,
            page: 1,
            limit: 100,
          },
        }),
        api.get("/tasks", {
          params: {
            workspace: currentWorkspace._id,
            page: 1,
            limit: 100,
          },
        }),
      ]);

      const projectsData = projectsResponse.data.data;

      const tasksData = tasksResponse.data.data;

      setProjects(projectsData?.projects || []);

      setTasks(tasksData?.tasks || []);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceLoading || !currentWorkspace?._id) {
      return;
    }

    fetchDashboardData();
  }, [currentWorkspace?._id, workspaceLoading]);

  const completedTasks = tasks.filter(
    (task) => task.status === "completed",
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "in-progress",
  ).length;

  const todoTasks = tasks.filter((task) => task.status === "todo").length;

  const completionPercentage =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  if (workspaceLoading || loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#DCE6DF]">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#315C4B] border-t-transparent" />
          </div>

          <p className="mt-4 text-sm text-[#68746E]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-[#E8C9C7] bg-[#F8ECEB] p-5">
        <p className="text-sm font-medium text-[#8A2638]">{error}</p>

        <button
          type="button"
          onClick={fetchDashboardData}
          className="mt-3 text-sm font-medium text-[#8A2638] underline underline-offset-4 hover:text-[#6F1E2D]"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-[#315C4B]">
              Workspace overview
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#18211D]">
              Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68746E]">
              A quick look at your projects, tasks, and current progress.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="inline-flex h-10 items-center justify-center gap-2 self-start border border-[#315C4B] bg-white px-4 text-sm font-medium text-[#315C4B] transition hover:bg-[#EAF1EC] sm:self-auto"
          >
            View projects
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<FolderKanban size={19} />}
          label="Projects"
          value={projects.length}
          description="Active workspace projects"
          iconBackground="bg-[#EAF1EC]"
          iconColor="text-[#315C4B]"
        />

        <StatCard
          icon={<CheckSquare size={19} />}
          label="Total tasks"
          value={tasks.length}
          description="Across all projects"
          iconBackground="bg-[#F2F0E9]"
          iconColor="text-[#68746E]"
        />

        <StatCard
          icon={<CircleCheck size={19} />}
          label="Completed"
          value={completedTasks}
          description="Finished tasks"
          iconBackground="bg-[#EAF1EC]"
          iconColor="text-[#315C4B]"
          valueColor="text-[#315C4B]"
        />

        <StatCard
          icon={<Clock3 size={19} />}
          label="In progress"
          value={inProgressTasks}
          description="Currently active"
          iconBackground="bg-[#F6E9EC]"
          iconColor="text-[#8A2638]"
          valueColor="text-[#8A2638]"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <section className="border border-[#DDE3DF] bg-white p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF1EC] text-[#315C4B]">
                <TrendingUp size={19} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[#18211D]">
                  Overall progress
                </h2>

                <p className="mt-1 text-sm text-[#68746E]">
                  Completion across your current tasks.
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-3xl font-semibold text-[#315C4B]">
                {completionPercentage}%
              </p>

              <p className="mt-1 text-xs text-[#89938E]">completed</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="h-2 overflow-hidden bg-[#E8ECE9]">
              <div
                className="h-full bg-[#315C4B] transition-all duration-500"
                style={{
                  width: `${completionPercentage}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <ProgressItem label="To do" value={todoTasks} />

            <ProgressItem label="In progress" value={inProgressTasks} />

            <ProgressItem label="Completed" value={completedTasks} accent />
          </div>
        </section>

        <section className="border border-[#DDE3DF] bg-[#18211D] p-6 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#315C4B]">
            <BriefcaseBusiness size={19} />
          </div>

          <h2 className="mt-5 text-lg font-semibold">Work summary</h2>

          <p className="mt-2 text-sm leading-6 text-[#AAB6B0]">
            Keep an eye on active work and move completed tasks forward.
          </p>

          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#AAB6B0]">Active tasks</span>

              <span className="text-lg font-semibold text-white">
                {inProgressTasks}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-[#AAB6B0]">Finished tasks</span>

              <span className="text-lg font-semibold text-[#BFD8C7]">
                {completedTasks}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/tasks")}
            className="mt-6 flex h-10 w-full items-center justify-center gap-2 bg-white px-4 text-sm font-medium text-[#18211D] transition hover:bg-[#EAF1EC]"
          >
            Open my tasks
            <ArrowRight size={16} />
          </button>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="border border-[#DDE3DF] bg-white">
          <div className="flex items-center justify-between border-b border-[#E7EBE8] p-6">
            <div>
              <h2 className="text-lg font-semibold text-[#18211D]">
                Recent tasks
              </h2>

              <p className="mt-1 text-sm text-[#68746E]">
                Your latest work items.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/tasks")}
              className="text-sm font-medium text-[#315C4B] hover:text-[#274D3F]"
            >
              View all
            </button>
          </div>

          <div className="p-6">
            {tasks.length === 0 ? (
              <EmptyState
                icon={<CheckSquare size={19} />}
                title="No tasks yet"
                description="Create your first task to start tracking work."
                buttonText="Create task"
                onClick={() => navigate("/tasks")}
              />
            ) : (
              <div className="space-y-1">
                {tasks.slice(0, 5).map((task) => (
                  <button
                    key={task._id}
                    type="button"
                    onClick={() => navigate(`/tasks/${task._id}`)}
                    className="flex w-full items-center justify-between gap-4 border-b border-[#E7EBE8] px-2 py-3 text-left transition last:border-0 hover:bg-[#F7F9F7]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#18211D]">
                        {task.title}
                      </p>

                      <p className="mt-1 truncate text-xs text-[#89938E]">
                        {task.project?.name || "No project"}
                      </p>
                    </div>

                    <StatusBadge status={task.status} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="border border-[#DDE3DF] bg-white">
          <div className="flex items-center justify-between border-b border-[#E7EBE8] p-6">
            <div>
              <h2 className="text-lg font-semibold text-[#18211D]">Projects</h2>

              <p className="mt-1 text-sm text-[#68746E]">
                Your latest workspace projects.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="text-sm font-medium text-[#315C4B] hover:text-[#274D3F]"
            >
              View all
            </button>
          </div>

          <div className="p-6">
            {projects.length === 0 ? (
              <EmptyState
                icon={<FolderKanban size={19} />}
                title="No projects yet"
                description="Create a project to organize your team's work."
                buttonText="Create project"
                onClick={() => navigate("/projects")}
              />
            ) : (
              <div className="space-y-1">
                {projects.slice(0, 5).map((project) => (
                  <button
                    key={project._id}
                    type="button"
                    onClick={() => navigate(`/projects/${project._id}`)}
                    className="flex w-full items-center justify-between gap-4 border-b border-[#E7EBE8] px-2 py-3 text-left transition last:border-0 hover:bg-[#F7F9F7]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#18211D]">
                        {project.name}
                      </p>

                      <p className="mt-1 truncate text-xs text-[#89938E]">
                        {project.description || "No description"}
                      </p>
                    </div>

                    <StatusBadge status={project.status} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  description,
  iconBackground,
  iconColor,
  valueColor = "text-[#18211D]",
}) => {
  return (
    <div className="border border-[#DDE3DF] bg-white p-5 transition hover:border-[#C9D5CE]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#68746E]">{label}</p>

          <p className={`mt-3 text-3xl font-semibold ${valueColor}`}>{value}</p>

          <p className="mt-2 text-xs text-[#89938E]">{description}</p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBackground} ${iconColor}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const ProgressItem = ({ label, value, accent = false }) => {
  return (
    <div className="border border-[#E7EBE8] bg-[#F7F9F7] p-3">
      <p className="text-xs text-[#89938E]">{label}</p>

      <p
        className={`mt-1 text-lg font-semibold ${
          accent ? "text-[#315C4B]" : "text-[#18211D]"
        }`}
      >
        {value}
      </p>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    todo: {
      label: "To do",
      className: "border-[#D6DDD8] bg-[#F4F6F2] text-[#68746E]",
    },

    "in-progress": {
      label: "In progress",
      className: "border-[#D8E4DC] bg-[#EAF1EC] text-[#315C4B]",
    },

    "in-review": {
      label: "In review",
      className: "border-[#E8D9C0] bg-[#F7F1E5] text-[#80663C]",
    },

    completed: {
      label: "Completed",
      className: "border-[#C9DDCE] bg-[#EFF6F0] text-[#315C4B]",
    },

    active: {
      label: "Active",
      className: "border-[#D8E4DC] bg-[#EAF1EC] text-[#315C4B]",
    },

    planning: {
      label: "Planning",
      className: "border-[#E8D9C0] bg-[#F7F1E5] text-[#80663C]",
    },

    completed_project: {
      label: "Completed",
      className: "border-[#C9DDCE] bg-[#EFF6F0] text-[#315C4B]",
    },
  };

  const config = statusConfig[status] || statusConfig.todo;

  return (
    <span
      className={`ml-2 shrink-0 border px-2.5 py-1 text-[11px] font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
};

const EmptyState = ({ icon, title, description, buttonText, onClick }) => {
  return (
    <div className="py-5 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF1EC] text-[#315C4B]">
        {icon}
      </div>

      <h3 className="mt-3 text-sm font-semibold text-[#18211D]">{title}</h3>

      <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[#89938E]">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#315C4B] hover:text-[#274D3F]"
      >
        {buttonText}
        <ArrowRight size={15} />
      </button>
    </div>
  );
};

export default Dashboard;
