import { useEffect, useState } from "react";
import {
  Sparkles,
  WandSparkles,
  FileText,
  ClipboardList,
  MessageSquareText,
  Send,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Bot,
  FolderKanban,
  CircleCheck,
} from "lucide-react";

import api from "../../services/api";

const AIAssistant = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  const [activeTool, setActiveTool] = useState("generate-task");

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const [requirement, setRequirement] = useState("");

  const [taskTitle, setTaskTitle] = useState("");

  const [meetingNotes, setMeetingNotes] = useState("");

  const [question, setQuestion] = useState("");

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      setError("");

      const response = await api.get("/projects", {
        params: {
          page: 1,
          limit: 100,
        },
      });

      const data = response.data.data;
      const projectList = data?.projects || [];

      setProjects(projectList);

      if (projectList.length > 0) {
        setSelectedProject((current) => current || projectList[0]._id);
      } else {
        setSelectedProject("");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load projects.");
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const selectedProjectData = projects.find(
    (project) => project._id === selectedProject,
  );

  const changeTool = (tool) => {
    setActiveTool(tool);
    setResult("");
    setError("");
    setCopied(false);
  };

  const handleGenerateTask = async (event) => {
    event.preventDefault();

    if (!selectedProject) {
      setError("Please select a project.");
      return;
    }

    if (requirement.trim().length < 10) {
      setError("Requirement must be at least 10 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult("");
      setCopied(false);

      const response = await api.post("/ai/generate-task", {
        projectId: selectedProject,
        requirement: requirement.trim(),
      });

      setResult(response.data.data || null);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to generate task.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDescription = async (event) => {
    event.preventDefault();

    if (!selectedProject) {
      setError("Please select a project.");
      return;
    }

    if (taskTitle.trim().length < 2) {
      setError("Task title must be at least 2 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult("");
      setCopied(false);

      const response = await api.post("/ai/generate-task-description", {
        projectId: selectedProject,
        title: taskTitle.trim(),
      });

      setResult(response.data.data || "");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to generate description.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSummarizeProject = async () => {
    if (!selectedProject) {
      setError("Please select a project.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult("");
      setCopied(false);

      const response = await api.post("/ai/summarize-project", {
        projectId: selectedProject,
      });

      setResult(response.data.data || "");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to summarize project.");
    } finally {
      setLoading(false);
    }
  };

  const handleMeetingToTasks = async (event) => {
    event.preventDefault();

    if (!selectedProject) {
      setError("Please select a project.");
      return;
    }

    if (meetingNotes.trim().length < 20) {
      setError("Meeting notes must be at least 20 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult("");
      setCopied(false);

      const response = await api.post("/ai/meeting-to-tasks", {
        projectId: selectedProject,
        notes: meetingNotes.trim(),
      });

      setResult(response.data.data || "");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to generate tasks from meeting notes.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProjectAssistant = async (event) => {
    event.preventDefault();

    if (!selectedProject) {
      setError("Please select a project.");
      return;
    }

    if (question.trim().length < 2) {
      setError("Question must be at least 2 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult("");
      setCopied(false);

      const response = await api.post("/ai/project-assistant", {
        projectId: selectedProject,
        question: question.trim(),
      });

      setResult(response.data.data || "");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to get an AI response.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) {
      return;
    }

    try {
      const textToCopy =
        typeof result === "string"
          ? result
          : `Task title: ${result.title}

Description: ${result.description}

Priority: ${result.priority}

Status: ${result.status}

Tags: ${result.tags?.join(", ") || "None"}`;

      await navigator.clipboard.writeText(textToCopy);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
    }
  };

  const clearResult = () => {
    setResult("");
    setCopied(false);
  };

  const renderToolForm = () => {
    if (activeTool === "generate-task") {
      return (
        <form onSubmit={handleGenerateTask} className="space-y-6">
          <ProjectField
            projects={projects}
            value={selectedProject}
            onChange={setSelectedProject}
            disabled={loadingProjects || loading}
          />

          <div>
            <FieldLabel label="Requirement" required />

            <textarea
              value={requirement}
              onChange={(event) => setRequirement(event.target.value)}
              placeholder="Describe what needs to be built, changed, or improved..."
              rows={8}
              disabled={loading}
              className="w-full resize-none rounded-lg border border-[#D6DDD8] bg-white px-4 py-3.5 text-sm leading-6 text-[#18211D] outline-none transition placeholder:text-[#9AA49F] hover:border-[#B8C3BD] focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] disabled:cursor-not-allowed disabled:bg-[#F4F6F2]"
            />

            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-[#89938E]">Minimum 10 characters</p>

              <p className="text-xs text-[#89938E]">
                {requirement.length} characters
              </p>
            </div>
          </div>

          <GenerateButton loading={loading} label="Generate Task" />
        </form>
      );
    }

    if (activeTool === "generate-description") {
      return (
        <form onSubmit={handleGenerateDescription} className="space-y-6">
          <ProjectField
            projects={projects}
            value={selectedProject}
            onChange={setSelectedProject}
            disabled={loadingProjects || loading}
          />

          <div>
            <FieldLabel label="Task title" required />

            <input
              type="text"
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
              placeholder="Example: Implement user authentication"
              disabled={loading}
              className="h-12 w-full rounded-lg border border-[#D6DDD8] bg-white px-4 text-sm text-[#18211D] outline-none transition placeholder:text-[#9AA49F] hover:border-[#B8C3BD] focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] disabled:cursor-not-allowed disabled:bg-[#F4F6F2]"
            />
          </div>

          <GenerateButton loading={loading} label="Generate Description" />
        </form>
      );
    }

    if (activeTool === "summarize-project") {
      return (
        <div className="space-y-6">
          <ProjectField
            projects={projects}
            value={selectedProject}
            onChange={setSelectedProject}
            disabled={loadingProjects || loading}
          />

          <div className="border border-[#D6DDD8] bg-[#F4F6F2] p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E2EEE6] text-[#315C4B]">
                <ClipboardList size={18} />
              </div>

              <div>
                <p className="text-sm font-medium text-[#18211D]">
                  What you'll get
                </p>

                <p className="mt-1.5 text-sm leading-6 text-[#68746E]">
                  AI will analyze the selected project's available information
                  and provide progress, completed work, pending work, potential
                  risks, and recommended next steps.
                </p>
              </div>
            </div>
          </div>

          <GenerateButton
            loading={loading}
            label="Summarize Project"
            onClick={handleSummarizeProject}
          />
        </div>
      );
    }

    if (activeTool === "meeting-to-tasks") {
      return (
        <form onSubmit={handleMeetingToTasks} className="space-y-6">
          <ProjectField
            projects={projects}
            value={selectedProject}
            onChange={setSelectedProject}
            disabled={loadingProjects || loading}
          />

          <div>
            <FieldLabel label="Meeting notes" required />

            <textarea
              value={meetingNotes}
              onChange={(event) => setMeetingNotes(event.target.value)}
              placeholder="Paste meeting notes, decisions, action items, and discussions here..."
              rows={10}
              disabled={loading}
              className="w-full resize-none rounded-lg border border-[#D6DDD8] bg-white px-4 py-3.5 text-sm leading-6 text-[#18211D] outline-none transition placeholder:text-[#9AA49F] hover:border-[#B8C3BD] focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] disabled:cursor-not-allowed disabled:bg-[#F4F6F2]"
            />

            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-[#89938E]">Minimum 20 characters</p>

              <p className="text-xs text-[#89938E]">
                {meetingNotes.length} characters
              </p>
            </div>
          </div>

          <GenerateButton loading={loading} label="Extract Tasks" />
        </form>
      );
    }

    return (
      <form onSubmit={handleProjectAssistant} className="space-y-6">
        <ProjectField
          projects={projects}
          value={selectedProject}
          onChange={setSelectedProject}
          disabled={loadingProjects || loading}
        />

        <div>
          <FieldLabel label="Your question" required />

          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask something about this project..."
            rows={8}
            disabled={loading}
            className="w-full resize-none rounded-lg border border-[#D6DDD8] bg-white px-4 py-3.5 text-sm leading-6 text-[#18211D] outline-none transition placeholder:text-[#9AA49F] hover:border-[#B8C3BD] focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] disabled:cursor-not-allowed disabled:bg-[#F4F6F2]"
          />

          <p className="mt-2 text-xs text-[#89938E]">
            Ask about tasks, progress, priorities, deadlines, or other
            information available in this project.
          </p>
        </div>

        <GenerateButton
          loading={loading}
          label="Ask Assistant"
          icon={<Send size={16} />}
        />
      </form>
    );
  };

  return (
    <div className="w-full pb-8">

      <section className="border-b border-[#DDE3DF] pb-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#315C4B] text-white">
                <Sparkles size={21} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight text-[#18211D] sm:text-3xl">
                    AI Assistant
                  </h1>

                  <span className="hidden items-center gap-1.5 border border-[#C9D9CF] bg-[#EDF4EF] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#315C4B] sm:flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#70A982]" />
                    Ready
                  </span>
                </div>

                <p className="mt-1 text-sm text-[#68746E]">
                  Intelligent tools for turning project information into useful
                  work.
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#68746E]">
              Generate tasks, write descriptions, summarize project progress,
              extract action items from meetings, and ask questions about your
              work.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 border border-[#D6DDD8] bg-white px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF1EC] text-[#315C4B]">
              <Bot size={17} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#89938E]">
                AI engine
              </p>

              <p className="mt-0.5 text-sm font-medium text-[#18211D]">
                TaskFlow AI
              </p>
            </div>

            <CircleCheck size={16} className="ml-2 text-[#315C4B]" />
          </div>
        </div>
      </section>

      <section className="mt-6 border border-[#D6DDD8] bg-white">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F4F6F2] text-[#315C4B]">
              <FolderKanban size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#89938E]">
                Working context
              </p>

              <p className="mt-1 truncate text-sm font-semibold text-[#18211D]">
                {selectedProjectData?.name || "Select a project"}
              </p>
            </div>
          </div>

          <div className="w-full md:w-80">
            <ProjectSelect
              projects={projects}
              value={selectedProject}
              onChange={setSelectedProject}
              disabled={loadingProjects || loading}
            />
          </div>
        </div>
      </section>

      {error && (
        <div className="mt-5 flex items-start gap-3 border border-[#E8C9C7] bg-[#F8ECEB] p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#8A2638]">
            <AlertCircle size={17} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#7D2334]">
              Something went wrong
            </p>

            <p className="mt-0.5 text-sm leading-5 text-[#8A2638]">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-lg leading-none text-[#8A2638] transition hover:bg-[#F2DDDB]"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <section className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">

        <aside className="h-fit border border-[#D6DDD8] bg-white">
          <div className="border-b border-[#E7EBE8] px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#89938E]">
              AI workspace
            </p>

            <p className="mt-1 text-sm text-[#68746E]">Choose a tool</p>
          </div>

          <div className="p-2">
            <ToolButton
              icon={<WandSparkles size={17} />}
              label="Generate Task"
              description="Turn a requirement into a task"
              active={activeTool === "generate-task"}
              onClick={() => changeTool("generate-task")}
            />

            <ToolButton
              icon={<FileText size={17} />}
              label="Task Description"
              description="Create a practical description"
              active={activeTool === "generate-description"}
              onClick={() => changeTool("generate-description")}
            />

            <ToolButton
              icon={<ClipboardList size={17} />}
              label="Project Summary"
              description="Understand project progress"
              active={activeTool === "summarize-project"}
              onClick={() => changeTool("summarize-project")}
            />

            <ToolButton
              icon={<MessageSquareText size={17} />}
              label="Meeting → Tasks"
              description="Extract action items"
              active={activeTool === "meeting-to-tasks"}
              onClick={() => changeTool("meeting-to-tasks")}
            />

            <ToolButton
              icon={<Sparkles size={17} />}
              label="Project Assistant"
              description="Ask about your project"
              active={activeTool === "project-assistant"}
              onClick={() => changeTool("project-assistant")}
            />
          </div>

          <div className="border-t border-[#E7EBE8] p-4">
            <div className="flex items-start gap-2.5">
              <Sparkles size={15} className="mt-0.5 shrink-0 text-[#315C4B]" />

              <p className="text-[11px] leading-5 text-[#89938E]">
                AI uses the selected project and information you provide to
                generate its response.
              </p>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="border border-[#D6DDD8] bg-white">

            <div className="border-b border-[#E7EBE8] px-5 py-5 sm:px-6">
              <ToolHeader tool={activeTool} />
            </div>

            <div className="p-5 sm:p-6">
              {loadingProjects ? (
                <LoadingProjects />
              ) : projects.length === 0 ? (
                <NoProjects />
              ) : (
                renderToolForm()
              )}
            </div>
          </div>

          {result && (
            <div className="mt-6 border border-[#8A2638] bg-white">
              <div className="flex flex-col gap-4 border-b border-[#E2C6CB] bg-[#F8ECEB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#8A2638] text-white">
                    <Sparkles size={17} />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#68746E]">
                      AI response
                    </p>

                    <h2 className="mt-0.5 text-base font-semibold text-[#18211D]">
                      Generated Result
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={clearResult}
                    className="h-9 px-3 text-xs font-medium text-[#68746E] transition hover:text-[#18211D]"
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex h-9 items-center gap-2 border border-[#C8D4CD] bg-white px-3 text-xs font-medium text-[#18211D] transition hover:border-[#315C4B] hover:bg-[#EAF1EC] hover:text-[#315C4B]"
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />}

                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="border border-[#E1E6E3] bg-[#FAFBFA]">
                  <div className="max-h-[600px] overflow-y-auto p-5 sm:p-6">
                    {activeTool === "generate-task" &&
                    typeof result === "object" ? (
                      <GeneratedTaskResult result={result} />
                    ) : (
                      <div className="whitespace-pre-wrap text-sm leading-7 text-[#18211D]">
                        {result}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-start gap-2">
                  <AlertCircle
                    size={14}
                    className="mt-0.5 shrink-0 text-[#89938E]"
                  />

                  <p className="text-[11px] leading-5 text-[#89938E]">
                    Review AI-generated content before adding it to your project
                    or sharing it with your team.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </section>

      <div className="mt-6 flex items-start gap-3 border border-[#D6DDD8] bg-[#F4F6F2] p-4">
        <Sparkles size={16} className="mt-0.5 shrink-0 text-[#315C4B]" />

        <p className="text-xs leading-5 text-[#68746E]">
          TaskFlow AI is designed to assist your workflow, not replace your
          team's judgment. Always review generated tasks, summaries, and
          recommendations before using them.
        </p>
      </div>
    </div>
  );
};

const ToolButton = ({ icon, label, description, active, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-3 border-l-2 px-3 py-3 text-left transition ${
        active
          ? "border-[#315C4B] bg-[#EAF1EC]"
          : "border-transparent hover:border-[#BFD8C7] hover:bg-[#F7F9F7]"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
          active
            ? "bg-[#315C4B] text-white"
            : "bg-[#F4F6F2] text-[#68746E] group-hover:bg-[#EAF1EC] group-hover:text-[#315C4B]"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-medium ${
            active ? "text-[#18211D]" : "text-[#33403A]"
          }`}
        >
          {label}
        </p>

        <p className="mt-0.5 truncate text-[11px] leading-4 text-[#89938E]">
          {description}
        </p>
      </div>

      <ChevronRight
        size={15}
        className={`shrink-0 transition ${
          active
            ? "text-[#315C4B]"
            : "text-[#B2BCB7] group-hover:text-[#315C4B]"
        }`}
      />
    </button>
  );
};

const ToolHeader = ({ tool }) => {
  const config = {
    "generate-task": {
      title: "Generate a Task",
      description:
        "Turn a requirement into a structured development task with useful priorities and tags.",
      icon: <WandSparkles size={19} />,
    },

    "generate-description": {
      title: "Generate Task Description",
      description:
        "Give AI a task title and get a clear, practical description your team can work with.",
      icon: <FileText size={19} />,
    },

    "summarize-project": {
      title: "Summarize Project",
      description:
        "Get a manager-friendly view of progress, completed work, pending work, risks, and next steps.",
      icon: <ClipboardList size={19} />,
    },

    "meeting-to-tasks": {
      title: "Meeting Notes → Tasks",
      description:
        "Turn meeting notes into actionable tasks while avoiding invented people or responsibilities.",
      icon: <MessageSquareText size={19} />,
    },

    "project-assistant": {
      title: "Project Assistant",
      description:
        "Ask questions about the selected project and receive answers based only on its available data.",
      icon: <Sparkles size={19} />,
    },
  };

  const current = config[tool];

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF1EC] text-[#315C4B]">
        {current.icon}
      </div>

      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-[#18211D]">
          {current.title}
        </h2>

        <p className="mt-1 max-w-2xl text-sm leading-6 text-[#68746E]">
          {current.description}
        </p>
      </div>
    </div>
  );
};

const FieldLabel = ({ label, required = false }) => {
  return (
    <label className="mb-2.5 block text-sm font-medium text-[#18211D]">
      {label}

      {required && <span className="ml-1 text-[#8A2638]">*</span>}
    </label>
  );
};

const ProjectField = ({ projects, value, onChange, disabled }) => {
  return (
    <div>
      <FieldLabel label="Project" required />

      <ProjectSelect
        projects={projects}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />

      <p className="mt-2 text-xs text-[#89938E]">
        AI will use this project as the working context.
      </p>
    </div>
  );
};

const ProjectSelect = ({ projects, value, onChange, disabled }) => {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className="h-12 w-full rounded-lg border border-[#D6DDD8] bg-white px-3.5 text-sm font-medium text-[#18211D] outline-none transition hover:border-[#B8C3BD] focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] disabled:cursor-not-allowed disabled:bg-[#F4F6F2] disabled:text-[#89938E]"
    >
      <option value="">Select a project</option>

      {projects.map((project) => (
        <option key={project._id} value={project._id}>
          {project.name}
        </option>
      ))}
    </select>
  );
};

const GenerateButton = ({ loading, label, onClick, icon }) => {
  return (
    <button
      type={onClick ? "button" : "submit"}
      onClick={onClick}
      disabled={loading}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#315C4B] px-4 text-sm font-semibold text-white transition hover:bg-[#274D3F] focus:outline-none focus:ring-2 focus:ring-[#BFD8C7] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#68746E]"
    >
      {loading ? (
        <>
          <RefreshCw size={16} className="animate-spin" />
          Working...
        </>
      ) : (
        <>
          {icon || <Sparkles size={16} />}
          {label}
        </>
      )}
    </button>
  );
};

const LoadingProjects = () => {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#EAF1EC] text-[#315C4B]">
        <RefreshCw size={19} className="animate-spin" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-[#18211D]">
        Loading your projects
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-[#89938E]">
        Preparing your AI workspace...
      </p>
    </div>
  );
};

const GeneratedTaskResult = ({ result }) => {
  const priorityStyles = {
    low: "bg-[#F1F4F2] text-[#68746E] border-[#D6DDD8]",
    medium: "bg-[#EAF1EC] text-[#315C4B] border-[#BFD8C7]",
    high: "bg-[#F7EEE9] text-[#8A5A3C] border-[#E6D2C6]",
    urgent: "bg-[#F8ECEB] text-[#8A2638] border-[#E8C9C7]",
  };

  const statusLabels = {
    todo: "To Do",
    "in-progress": "In Progress",
    "in-review": "In Review",
    completed: "Completed",
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#89938E]">
          Task title
        </p>

        <h3 className="mt-2 text-xl font-semibold leading-7 text-[#18211D]">
          {result.title}
        </h3>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#89938E]">
          Description
        </p>

        <div className="mt-2 border border-[#D6DDD8] bg-white p-4">
          <p className="whitespace-pre-wrap text-sm leading-7 text-[#68746E]">
            {result.description}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="border border-[#E1E6E3] bg-[#F7F9F7] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#89938E]">
            Priority
          </p>

          <span
            className={`mt-2 inline-flex border px-2.5 py-1 text-xs font-semibold capitalize ${
              priorityStyles[result.priority] || priorityStyles.medium
            }`}
          >
            {result.priority || "Medium"}
          </span>
        </div>

        <div className="border border-[#E1E6E3] bg-[#F7F9F7] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#89938E]">
            Status
          </p>

          <span className="mt-2 inline-flex border border-[#D6DDD8] bg-white px-2.5 py-1 text-xs font-semibold text-[#315C4B]">
            {statusLabels[result.status] || result.status}
          </span>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#89938E]">
          Suggested tags
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          {result.tags?.length > 0 ? (
            result.tags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="border border-[#C9D9CF] bg-[#EAF1EC] px-2.5 py-1 text-xs font-medium text-[#315C4B]"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-sm text-[#89938E]">No tags suggested</span>
          )}
        </div>
      </div>
    </div>
  );
};

const NoProjects = () => {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#EAF1EC] text-[#315C4B]">
        <FolderKanban size={21} />
      </div>

      <h3 className="mt-4 text-base font-semibold text-[#18211D]">
        No projects available
      </h3>

      <p className="mt-1 max-w-md text-sm leading-6 text-[#68746E]">
        Create a project first before using the AI project tools.
      </p>
    </div>
  );
};

export default AIAssistant;
