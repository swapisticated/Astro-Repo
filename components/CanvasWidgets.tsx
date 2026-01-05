"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, Box, Users, Activity, GitCommit, X } from "lucide-react";

type ThemeType = "modern" | "pencil" | "comic";

interface CanvasWidgetProps {
  title: string;
  theme: ThemeType;
  children: React.ReactNode;
  icon: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export const CanvasWidget: React.FC<CanvasWidgetProps> = ({
  title,
  theme,
  children,
  icon,
  defaultExpanded = false,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getContainerStyles = () => {
    switch (theme) {
      case "pencil":
        return "bg-white/90 border-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black";
      case "comic":
        return "bg-[#f0e6d2]/90 border-black border-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-black";
      default:
        return "bg-white/90 border-[#d0d7de] shadow-lg text-[#1f2328]";
    }
  };

  const getTitleStyles = () => {
    switch (theme) {
      case "pencil":
      case "comic":
        return "font-['Patrick_Hand'] text-base text-black";
      default:
        return "text-[10px] uppercase tracking-wider text-[#656d76]";
    }
  };

  return (
    <div className={`relative pointer-events-auto ${className}`}>
      <AnimatePresence mode="wait" initial={false}>
        {!isExpanded ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(true)}
            className={`w-10 h-10 flex items-center justify-center cursor-pointer rounded-md border backdrop-blur-sm transition-colors ${getContainerStyles()}`}
            title={title}
          >
            <div className="opacity-70">{icon}</div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className={`rounded-md border backdrop-blur-sm w-64 ${getContainerStyles()}`}
          >
            <div
              className="flex items-center justify-between p-3 border-b border-inherit cursor-pointer"
              onClick={() => setIsExpanded(false)}
            >
              <div className="flex items-center gap-2">
                <span className="opacity-70 scale-75">{icon}</span>
                <span className={`font-bold ${getTitleStyles()}`}>{title}</span>
              </div>
              <X className="w-4 h-4 opacity-40 hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Stats Widget
interface StatsWidgetProps {
  theme: ThemeType;
  stats: {
    files: number;
    dirs: number;
    totalSize: number;
  } | null;
  owner: string;
  repo: string;
  branch?: string;
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({
  theme,
  stats,
  owner,
  repo,
  branch,
}) => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getValueStyles = () => {
    switch (theme) {
      case "pencil":
        return "font-['Patrick_Hand'] text-lg text-black font-bold";
      case "comic":
        return "font-['Patrick_Hand'] text-lg text-black font-bold";
      default:
        return "text-lg font-bold text-[#1f2328]";
    }
  };

  const getLabelStyles = () => {
    switch (theme) {
      case "pencil":
        return "font-['Patrick_Hand'] text-xs text-gray-600";
      case "comic":
        return "font-['Patrick_Hand'] text-xs text-gray-700";
      default:
        return "text-[10px] uppercase tracking-wider text-[#656d76]";
    }
  };

  const getIconBg = () => {
    switch (theme) {
      case "pencil":
        return "bg-gray-100 border-black border";
      case "comic":
        return "bg-orange-100 border-black border-2";
      default:
        return "bg-blue-50";
    }
  };

  if (!stats) return null;

  return (
    <CanvasWidget
      title="Repository Info"
      icon={<Box className="w-5 h-5" />}
      theme={theme}
      defaultExpanded={false}
    >
      <div className="space-y-3">
        <div className="text-center pb-2 border-b border-inherit">
          <div
            className={`font-bold ${
              theme === "modern" ? "text-sm" : "font-['Patrick_Hand']"
            }`}
          >
            {owner}/{repo}
          </div>
          {branch && (
            <div className="flex items-center justify-center gap-1.5 text-xs opacity-60 mt-1">
              <GitBranch className="w-3 h-3" />
              <span>{branch}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className={`p-2 rounded-lg ${getIconBg()}`}>
            <div className={getValueStyles()}>{stats.files}</div>
            <div className={getLabelStyles()}>Files</div>
          </div>
          <div className={`p-2 rounded-lg ${getIconBg()}`}>
            <div className={getValueStyles()}>{stats.dirs}</div>
            <div className={getLabelStyles()}>Dirs</div>
          </div>
          <div className={`p-2 rounded-lg col-span-2 ${getIconBg()}`}>
            <div className={getValueStyles()}>
              {formatBytes(stats.totalSize)}
            </div>
            <div className={getLabelStyles()}>Size</div>
          </div>
        </div>

        <a
          href={`https://github.com/${owner}/${repo}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`block text-center py-2 rounded-lg text-xs font-medium transition-colors ${
            theme === "pencil"
              ? "bg-gray-900 text-white hover:bg-gray-800"
              : theme === "comic"
              ? "bg-orange-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-orange-600"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          View on GitHub
        </a>
      </div>
    </CanvasWidget>
  );
};

// Commits Widget
interface CommitsWidgetProps {
  theme: ThemeType;
  owner: string;
  repo: string;
  branch?: string;
}

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
  avatar?: string;
}

export const CommitsWidget: React.FC<CommitsWidgetProps> = ({
  theme,
  owner,
  repo,
  branch = "main",
}) => {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchCommits = async () => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch}&per_page=5`
        );
        if (res.ok) {
          const data = await res.json();
          setCommits(
            data.map(
              (c: {
                sha: string;
                commit: {
                  message: string;
                  author: { name: string; date: string };
                };
                author?: { avatar_url: string };
              }) => ({
                sha: c.sha.substring(0, 7),
                message: c.commit.message.split("\n")[0],
                author: c.commit.author.name,
                date: new Date(c.commit.author.date).toLocaleDateString(),
                avatar: c.author?.avatar_url,
              })
            )
          );
        }
      } catch (e) {
        console.error("Failed to fetch commits", e);
      } finally {
        setLoading(false);
      }
    };
    if (owner && repo) fetchCommits();
  }, [owner, repo, branch]);

  const getCommitStyles = () => {
    switch (theme) {
      case "pencil":
        return "bg-gray-50 border-black border hover:bg-gray-100";
      case "comic":
        return "bg-orange-50 border-black border-2 hover:bg-orange-100 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]";
      default:
        return "bg-gray-50 border border-gray-200 hover:bg-gray-100";
    }
  };

  return (
    <CanvasWidget
      title="Commits"
      icon={<GitCommit className="w-5 h-5" />}
      theme={theme}
      defaultExpanded={false}
    >
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {loading ? (
          <div className="text-xs opacity-50 text-center py-4">Loading...</div>
        ) : commits.length === 0 ? (
          <div className="text-xs opacity-50 text-center py-4">
            No commits found
          </div>
        ) : (
          commits.map((commit) => (
            <div
              key={commit.sha}
              className={`p-2 rounded-lg ${getCommitStyles()} transition-colors`}
            >
              <div className="flex items-start gap-2">
                {commit.avatar && (
                  <img
                    src={commit.avatar}
                    alt={commit.author}
                    className="w-5 h-5 rounded-full"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">
                    {commit.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono opacity-50">
                      {commit.sha}
                    </span>
                    <span className="text-[10px] opacity-50">
                      {commit.date}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </CanvasWidget>
  );
};

// Contributors Widget
interface ContributorsWidgetProps {
  theme: ThemeType;
  owner: string;
  repo: string;
}

interface Contributor {
  login: string;
  avatar: string;
  contributions: number;
  url: string;
}

export const ContributorsWidget: React.FC<ContributorsWidgetProps> = ({
  theme,
  owner,
  repo,
}) => {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchContributors = async () => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=8`
        );
        if (res.ok) {
          const data = await res.json();
          setContributors(
            data.map(
              (c: {
                login: string;
                avatar_url: string;
                contributions: number;
                html_url: string;
              }) => ({
                login: c.login,
                avatar: c.avatar_url,
                contributions: c.contributions,
                url: c.html_url,
              })
            )
          );
        }
      } catch (e) {
        console.error("Failed to fetch contributors", e);
      } finally {
        setLoading(false);
      }
    };
    if (owner && repo) fetchContributors();
  }, [owner, repo]);

  const getContributorStyles = () => {
    switch (theme) {
      case "pencil":
        return "border-black border-2 hover:bg-gray-100";
      case "comic":
        return "border-black border-2 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-orange-50";
      default:
        return "border border-gray-200 hover:bg-gray-50";
    }
  };

  return (
    <CanvasWidget
      title="Contributors"
      icon={<Users className="w-5 h-5" />}
      theme={theme}
      defaultExpanded={false}
    >
      <div className="mt-2">
        {loading ? (
          <div className="text-xs opacity-50 text-center py-4">Loading...</div>
        ) : contributors.length === 0 ? (
          <div className="text-xs opacity-50 text-center py-4">
            No contributors found
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {contributors.map((contributor) => (
              <a
                key={contributor.login}
                href={contributor.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`relative group rounded-lg overflow-hidden ${getContributorStyles()} transition-colors`}
                title={`${contributor.login} (${contributor.contributions} commits)`}
              >
                <img
                  src={contributor.avatar}
                  alt={contributor.login}
                  className="w-full aspect-square object-cover"
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </CanvasWidget>
  );
};

// Activity Widget
interface ActivityWidgetProps {
  theme: ThemeType;
  owner: string;
  repo: string;
}

interface ActivityEvent {
  type: string;
  actor: string;
  action: string;
  date: string;
}

export const ActivityWidget: React.FC<ActivityWidgetProps> = ({
  theme,
  owner,
  repo,
}) => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/events?per_page=6`
        );
        if (res.ok) {
          const data = await res.json();
          setEvents(
            data.map(
              (e: {
                type: string;
                actor: { login: string };
                created_at: string;
                payload?: { action?: string; ref_type?: string };
              }) => {
                let action = "";
                switch (e.type) {
                  case "PushEvent":
                    action = "pushed commits";
                    break;
                  case "PullRequestEvent":
                    action = `${e.payload?.action} PR`;
                    break;
                  case "IssuesEvent":
                    action = `${e.payload?.action} issue`;
                    break;
                  case "CreateEvent":
                    action = `created ${e.payload?.ref_type || ""}`;
                    break;
                  case "DeleteEvent":
                    action = `deleted ${e.payload?.ref_type || ""}`;
                    break;
                  case "WatchEvent":
                    action = "starred repo";
                    break;
                  case "ForkEvent":
                    action = "forked repo";
                    break;
                  case "IssueCommentEvent":
                    action = "commented";
                    break;
                  default:
                    action = e.type.replace("Event", "");
                }
                return {
                  type: e.type,
                  actor: e.actor.login,
                  action,
                  date: new Date(e.created_at).toLocaleDateString(),
                };
              }
            )
          );
        }
      } catch (e) {
        console.error("Failed to fetch activity", e);
      } finally {
        setLoading(false);
      }
    };
    if (owner && repo) fetchActivity();
  }, [owner, repo]);

  const getEventStyles = () => {
    switch (theme) {
      case "pencil":
        return "border-l-2 border-black pl-2";
      case "comic":
        return "border-l-4 border-black pl-2";
      default:
        return "border-l-2 border-blue-400 pl-2";
    }
  };

  return (
    <CanvasWidget
      title="Activity"
      icon={<Activity className="w-5 h-5" />}
      theme={theme}
      defaultExpanded={false}
    >
      <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
        {loading ? (
          <div className="text-xs opacity-50 text-center py-4">Loading...</div>
        ) : events.length === 0 ? (
          <div className="text-xs opacity-50 text-center py-4">
            No recent activity
          </div>
        ) : (
          events.map((event, i) => (
            <div key={i} className={`py-1 ${getEventStyles()}`}>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium">{event.actor}</span>
              </div>
              <div className="text-[10px] opacity-60 mt-0.5">
                {event.action} • {event.date}
              </div>
            </div>
          ))
        )}
      </div>
    </CanvasWidget>
  );
};

// Unused exports for compatibility
export const ControlsWidget: React.FC<{ theme: ThemeType }> = () => null;
export const SelectedNodeWidget: React.FC<{
  theme: ThemeType;
  node: unknown;
  onClose?: () => void;
}> = () => null;
