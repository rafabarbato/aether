import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Paperclip, Edit2, Trash2, Send, Upload, Download, Calendar, Clock, Tag, User } from 'lucide-react';
import { Task } from '../types';
import commentService, { Comment, CreateCommentDto } from '../services/commentService';
import attachmentService, { Attachment } from '../services/attachmentService';
import { useAuth } from '../contexts/AuthContext';

interface TaskDetailModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate?: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onTaskUpdate,
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'attachments'>('comments');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && task) {
      loadComments();
      loadAttachments();
    }
  }, [isOpen, task]);

  const loadComments = async () => {
    try {
      setIsLoadingComments(true);
      const data = await commentService.getTaskComments(task.id);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const loadAttachments = async () => {
    try {
      setIsLoadingAttachments(true);
      const data = await attachmentService.getTaskAttachments(task.id);
      setAttachments(data);
    } catch (error) {
      console.error('Failed to load attachments:', error);
    } finally {
      setIsLoadingAttachments(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const commentData: CreateCommentDto = {
        taskId: task.id,
        content: newComment,
        parentId: replyTo || undefined,
      };
      await commentService.createComment(commentData);
      setNewComment('');
      setReplyTo(null);
      await loadComments();
    } catch (error) {
      console.error('Failed to create comment:', error);
      alert('Failed to create comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editContent.trim()) return;

    try {
      await commentService.updateComment(commentId, { content: editContent });
      setEditingComment(null);
      setEditContent('');
      await loadComments();
    } catch (error) {
      console.error('Failed to update comment:', error);
      alert('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentService.deleteComment(commentId);
      await loadComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await attachmentService.uploadAttachment(task.id, file);
      await loadAttachments();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload attachment:', error);
      alert('Failed to upload attachment');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (!confirm('Are you sure you want to delete this attachment?')) return;

    try {
      await attachmentService.deleteAttachment(attachmentId);
      await loadAttachments();
    } catch (error) {
      console.error('Failed to delete attachment:', error);
      alert('Failed to delete attachment');
    }
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => {
    const isAuthor = user?.id === comment.userId;
    const isEditing = editingComment === comment.id;

    return (
      <div
        key={comment.id}
        className={`${isReply ? 'ml-12 mt-2' : 'mt-4'} bg-gray-50 dark:bg-gray-900 rounded-lg p-4`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {comment.user?.photoUrl ? (
              <img
                src={comment.user.photoUrl}
                alt={comment.user.username}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                {comment.user?.firstName?.[0] || 'U'}
              </div>
            )}
            <div>
              <div className="font-medium text-gray-900 dark:text-white text-sm">
                {comment.user?.firstName} {comment.user?.lastName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(comment.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          {isAuthor && !isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingComment(comment.id);
                  setEditContent(comment.content);
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Edit"
              >
                <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="mt-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm"
              rows={3}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleUpdateComment(comment.id)}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingComment(null);
                  setEditContent('');
                }}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white text-sm rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-3 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
              {comment.content}
            </div>
            {!isReply && (
              <button
                onClick={() => setReplyTo(comment.id)}
                className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Reply
              </button>
            )}
          </>
        )}

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  const statusColors = {
    ready: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    in_review: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    done: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {task.title}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[task.status]}`}>
                {task.status.toUpperCase().replace('_', ' ')}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
                {task.priority.toUpperCase()}
              </span>
              {task.tagLabel && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                  {task.tagLabel}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Main content - 2/3 width */}
            <div className="col-span-2">
              {/* Description */}
              {task.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                    Description
                  </h3>
                  <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    {task.description}
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                <div className="flex gap-6">
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'comments'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Comments ({comments.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('attachments')}
                    className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'attachments'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    <Paperclip className="w-4 h-4 inline mr-2" />
                    Attachments ({attachments.length})
                  </button>
                </div>
              </div>

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div>
                  {/* Comment form */}
                  <form onSubmit={handleSubmitComment} className="mb-6">
                    {replyTo && (
                      <div className="flex items-center justify-between mb-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>Replying to comment</span>
                        <button
                          type="button"
                          onClick={() => setReplyTo(null)}
                          className="text-red-600 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-500"
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting || !newComment.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                        {isSubmitting ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                  </form>

                  {/* Comments list */}
                  {isLoadingComments ? (
                    <div className="text-center py-8 text-gray-500">Loading comments...</div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No comments yet</div>
                  ) : (
                    <div>{comments.map((comment) => renderComment(comment))}</div>
                  )}
                </div>
              )}

              {/* Attachments Tab */}
              {activeTab === 'attachments' && (
                <div>
                  {/* Upload button */}
                  <div className="mb-6">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      {isUploading ? 'Uploading...' : 'Upload Attachment'}
                    </button>
                  </div>

                  {/* Attachments list */}
                  {isLoadingAttachments ? (
                    <div className="text-center py-8 text-gray-500">Loading attachments...</div>
                  ) : attachments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No attachments yet</div>
                  ) : (
                    <div className="space-y-3">
                      {attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-lg p-4"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="text-2xl">
                              {attachmentService.getFileIcon(attachment.mimeType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                {attachment.fileName}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {attachmentService.formatFileSize(attachment.fileSize)} • Uploaded by{' '}
                                {attachment.user?.firstName} {attachment.user?.lastName} •{' '}
                                {new Date(attachment.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={attachmentService.getDownloadUrl(attachment.id)}
                              download
                              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                              title="Download"
                            >
                              <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </a>
                            {user?.id === attachment.userId && (
                              <button
                                onClick={() => handleDeleteAttachment(attachment.id)}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="col-span-1">
              <div className="space-y-4">
                {/* Assignee */}
                {task.assignee && (
                  <div>
                    <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                      <User className="w-3 h-3 inline mr-1" />
                      Assignee
                    </h3>
                    <div className="flex items-center gap-2">
                      {task.assignee.photoUrl ? (
                        <img
                          src={task.assignee.photoUrl}
                          alt={task.assignee.username}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                          {task.assignee.firstName[0]}
                        </div>
                      )}
                      <span className="text-sm text-gray-900 dark:text-white">
                        {task.assignee.firstName} {task.assignee.lastName}
                      </span>
                    </div>
                  </div>
                )}

                {/* Due Date */}
                {task.dueDate && (
                  <div>
                    <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Due Date
                    </h3>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                )}

                {/* Estimated Hours */}
                {task.estimatedHours && (
                  <div>
                    <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Estimated Hours
                    </h3>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {task.estimatedHours}h
                    </div>
                  </div>
                )}

                {/* Milestone */}
                {task.milestone && (
                  <div>
                    <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                      <Tag className="w-3 h-3 inline mr-1" />
                      Milestone
                    </h3>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {task.milestone.name}
                    </div>
                  </div>
                )}

                {/* Created */}
                <div>
                  <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                    Created
                  </h3>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Updated */}
                {task.updatedAt && (
                  <div>
                    <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                      Last Updated
                    </h3>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(task.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
