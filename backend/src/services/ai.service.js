import ApiError from "../utils/ApiError.js";

import groq from "../config/groq.js";

import Project from "../models/Project.js";

import Task from "../models/Task.js";

const getAIResponse = async (prompt) => {
  if (!prompt || !prompt.trim()) {
    throw new ApiError(400, "AI prompt cannot be empty");
  }

  try {
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",

      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],

      include_reasoning: false,
    });

    const content = response.choices[0]?.message?.content?.trim() || "";

    if (!content) {
      throw new ApiError(502, "AI service returned an empty response");
    }

    return content;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error?.status === 429) {
      throw new ApiError(
        429,
        "AI usage limit reached. Please try again later.",
      );
    }

    if (error?.status === 401 || error?.status === 403) {
      throw new ApiError(500, "AI service authentication failed");
    }

    if (
      error?.status === 500 ||
      error?.status === 502 ||
      error?.status === 503
    ) {
      throw new ApiError(502, "AI service is temporarily unavailable");
    }

    throw new ApiError(502, "AI service is temporarily unavailable");
  }
};

const parseAIJson = (content) => {
  try {
    return JSON.parse(content);
  } catch (error) {
    try {
      const cleanedContent = content
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      return JSON.parse(cleanedContent);
    } catch (parseError) {
      throw new ApiError(502, "AI returned an invalid structured response");
    }
  }
};

export const generateTask = async ({ requirement, projectContext = "" }) => {
  if (!requirement || !requirement.trim()) {
    throw new ApiError(400, "Requirement cannot be empty");
  }

  const prompt = `
You are an AI project management assistant for TaskFlow AI.

Generate a useful, professional software development task
from the requirement provided below.

TaskFlow AI uses a mature and professional product design system.

When the requirement involves UI or frontend work:
- Prefer practical and professional design decisions.
- Avoid neon colors.
- Avoid unnecessary gradients.
- Avoid glow effects.
- Avoid glassmorphism.
- Avoid generic or overly flashy styling.
- Prefer consistency with an existing design system.
- Consider accessibility where relevant.

Do not blindly follow a color or styling request if it would
conflict with professional UX or accessibility. Interpret the
requirement intelligently.

Requirement:

${requirement}

Project context:

${projectContext || "No additional project context provided."}

Return ONLY valid JSON.

Do not use markdown.
Do not use code fences.
Do not add explanations before or after the JSON.

The JSON must have exactly this structure:

{
  "title": "Short and professional task title",
  "description": "Clear and actionable task description",
  "priority": "low",
  "status": "todo",
  "tags": ["tag1", "tag2"]
}

Rules:

- title must be concise and professional.
- description should explain what needs to be done clearly.
- priority must be one of: low, medium, high, urgent.
- status must be one of: todo, in-progress, in-review, completed.
- tags must be a useful array of short strings.
- Do not invent unnecessary requirements.
- Keep the task practical and suitable for a real development team.
- If the requirement is a UI task, mention accessibility only when relevant.
`;

  const response = await getAIResponse(prompt);

  const parsedResponse = parseAIJson(response);

  if (!parsedResponse || typeof parsedResponse !== "object") {
    throw new ApiError(502, "AI returned an invalid task response");
  }

  if (!parsedResponse.title || !parsedResponse.description) {
    throw new ApiError(502, "AI returned an incomplete task response");
  }

  return {
    title: parsedResponse.title,
    description: parsedResponse.description,
    priority: parsedResponse.priority || "medium",
    status: parsedResponse.status || "todo",
    tags: Array.isArray(parsedResponse.tags) ? parsedResponse.tags : [],
  };
};

export const generateTaskDescription = async ({ title, context = "" }) => {
  const prompt = `
Generate a clear and practical task description for a project
management system.

Task title:

${title}

Context:

${context}

Keep the description concise and actionable.

Do not add unnecessary information.
`;

  return getAIResponse(prompt);
};

export const summarizeProject = async ({
  projectName,
  projectDescription = "",
  tasks = [],
}) => {
  const prompt = `
Summarize this project for a team manager.

Project:

${projectName}

Description:

${projectDescription}

Tasks:

${JSON.stringify(tasks)}

Provide:

- Overall progress
- Important completed work
- Pending work
- Potential risks
- Recommended next steps

Keep the summary practical and easy to understand.
`;

  return getAIResponse(prompt);
};

export const meetingNotesToTasks = async ({ meetingNotes }) => {
  const prompt = `
Analyze the following meeting notes and identify actionable tasks.

Meeting notes:

${meetingNotes}

For each task provide:

- Task title
- Description
- Suggested priority
- Suggested assignee if explicitly mentioned

Do not invent people who are not mentioned.

Keep the tasks practical and concise.
`;

  return getAIResponse(prompt);
};

export const askProjectAssistant = async ({ projectId, question }) => {
  if (!question || !question.trim()) {
    throw new ApiError(400, "Question cannot be empty");
  }

  const project = await Project.findById(projectId)
    .populate("createdBy", "name email")
    .populate("members", "name email");

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const tasks = await Task.find({
    project: projectId,
  })
    .select("title description status priority assignedTo dueDate")
    .populate("assignedTo", "name email")
    .lean();

  const prompt = `
You are an AI project management assistant.

Answer the user's question using only the project information
provided below.

Project:

Name: ${project.name}

Description: ${project.description || "No description"}

Status: ${project.status}

Priority: ${project.priority}

Tasks:

${JSON.stringify(tasks, null, 2)}

User question:

${question}

Give a clear and practical answer.

If the information is not available in the project data,
say that it is not available.

Do not invent information.
`;

  return getAIResponse(prompt);
};
