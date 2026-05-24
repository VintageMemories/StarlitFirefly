'use client'

import { useState } from 'react'
import {
  Download,
  FolderOpen,
  Pause,
  Play,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  FileMusic,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useDownloadStore, type DownloadTask } from '@/stores/downloadStore'

interface DownloadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function StatusBadge({ status }: { status: DownloadTask['status'] }) {
  const config = {
    downloading: {
      icon: <Download className="w-3 h-3" />,
      label: '下载中',
      className: 'bg-[#4FD1C5]/15 text-[#4FD1C5] border-[#4FD1C5]/20',
    },
    paused: {
      icon: <Pause className="w-3 h-3" />,
      label: '已暂停',
      className: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    },
    completed: {
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: '已完成',
      className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    },
    failed: {
      icon: <XCircle className="w-3 h-3" />,
      label: '失败',
      className: 'bg-red-500/15 text-red-400 border-red-500/20',
    },
  }

  const { icon, label, className } = config[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border',
        className
      )}
    >
      {icon}
      {label}
    </span>
  )
}

export default function DownloadDialog({ open, onOpenChange }: DownloadDialogProps) {
  const { tasks, downloadPath, removeTask, clearCompleted, pauseTask, resumeTask, setDownloadPath } =
    useDownloadStore()
  const [isEditingPath, setIsEditingPath] = useState(false)
  const [tempPath, setTempPath] = useState(downloadPath)

  const activeTasks = tasks.filter((t) => t.status === 'downloading' || t.status === 'paused' || t.status === 'failed')
  const completedTasks = tasks.filter((t) => t.status === 'completed')

  const handleSavePath = () => {
    if (tempPath.trim()) {
      setDownloadPath(tempPath.trim())
    }
    setIsEditingPath(false)
  }

  const handleCancelEditPath = () => {
    setTempPath(downloadPath)
    setIsEditingPath(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#06080E] border-white/[0.08] text-white/90 sm:max-w-[520px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white/90">
            <Download className="w-5 h-5 text-[#4FD1C5]" />
            下载管理
          </DialogTitle>
          <DialogDescription className="text-white/40 text-sm">
            管理你的下载任务和下载路径
          </DialogDescription>
        </DialogHeader>

        {/* Download Path Setting */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
            下载路径
          </label>
          <div className="flex items-center gap-2">
            {isEditingPath ? (
              <>
                <Input
                  value={tempPath}
                  onChange={(e) => setTempPath(e.target.value)}
                  className="h-8 text-xs bg-white/[0.06] border-white/[0.1] text-white/80 placeholder:text-white/25 focus-visible:border-[#4FD1C5]/50 focus-visible:ring-[#4FD1C5]/20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSavePath()
                    if (e.key === 'Escape') handleCancelEditPath()
                  }}
                  autoFocus
                />
                <Button
                  size="sm"
                  className="h-8 px-3 text-xs bg-[#4FD1C5]/20 text-[#4FD1C5] hover:bg-[#4FD1C5]/30 border border-[#4FD1C5]/20"
                  onClick={handleSavePath}
                >
                  保存
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
                  onClick={handleCancelEditPath}
                >
                  取消
                </Button>
              </>
            ) : (
              <>
                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                  <FolderOpen className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                  <span className="text-xs text-white/60 truncate">{downloadPath}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs text-white/40 hover:text-[#4FD1C5] hover:bg-[#4FD1C5]/10"
                  onClick={() => {
                    setTempPath(downloadPath)
                    setIsEditingPath(true)
                  }}
                >
                  更改
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Task Lists */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-4 pr-2">
            {/* Active Downloads */}
            {activeTasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider">
                    进行中的下载 ({activeTasks.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {activeTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          <FileMusic className="w-4 h-4 text-[#4FD1C5]/60 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-white/80 truncate">{task.title}</p>
                            <p className="text-[11px] text-white/30 truncate">
                              {task.artist} · {task.album} · {task.fileSize}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <StatusBadge status={task.status} />
                        </div>
                      </div>
                      {task.status === 'downloading' && (
                        <div className="space-y-1">
                          <Progress
                            value={task.progress}
                            className="h-1.5 bg-white/[0.06]"
                          />
                          <div className="flex justify-between">
                            <span className="text-[11px] text-white/30">{task.progress}%</span>
                            <span className="text-[11px] text-white/30">
                              <Clock className="w-3 h-3 inline mr-0.5" />
                              下载中...
                            </span>
                          </div>
                        </div>
                      )}
                      {task.status === 'paused' && (
                        <div className="space-y-1">
                          <Progress
                            value={task.progress}
                            className="h-1.5 bg-white/[0.06]"
                          />
                          <span className="text-[11px] text-white/30">已暂停 - {task.progress}%</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 justify-end">
                        {task.status === 'downloading' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-white/40 hover:text-amber-400 hover:bg-amber-400/10"
                            onClick={() => pauseTask(task.id)}
                          >
                            <Pause className="w-3 h-3 mr-1" />
                            暂停
                          </Button>
                        )}
                        {task.status === 'paused' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-white/40 hover:text-[#4FD1C5] hover:bg-[#4FD1C5]/10"
                            onClick={() => resumeTask(task.id)}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            继续
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-white/40 hover:text-red-400 hover:bg-red-400/10"
                          onClick={() => removeTask(task.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          删除
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Downloads */}
            {completedTasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider">
                    已完成 ({completedTasks.length})
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px] text-white/30 hover:text-red-400 hover:bg-red-400/10"
                    onClick={clearCompleted}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    清除已完成
                  </Button>
                </div>
                <div className="space-y-1">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400/60 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-white/70 truncate">{task.title}</p>
                          <p className="text-[11px] text-white/30 truncate">
                            {task.artist} · {task.fileSize}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-opacity"
                        onClick={() => removeTask(task.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-white/25">
                <div className="w-16 h-16 rounded-full bg-[#4FD1C5]/[0.06] flex items-center justify-center mb-4 ring-1 ring-[#4FD1C5]/10">
                  <Download className="w-7 h-7 text-[#4FD1C5]/30" />
                </div>
                <p className="text-sm text-white/40 font-medium">暂无下载任务</p>
                <p className="text-xs text-white/20 mt-1">下载的歌曲将在这里显示进度</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
