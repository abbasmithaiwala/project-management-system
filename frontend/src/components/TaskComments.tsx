import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_TASK_COMMENTS } from '../graphql/queries';
import { CREATE_TASK_COMMENT } from '../graphql/mutations';
import Button from './common/Button';

interface TaskCommentsProps {
  taskId: string;
}

const TaskComments = ({ taskId }: TaskCommentsProps) => {
  const [newComment, setNewComment] = useState({
    content: '',
    authorEmail: '',
  });

  const { data, loading, refetch } = useQuery(GET_TASK_COMMENTS, {
    variables: { taskId },
  });

  const [createComment, { loading: creating }] = useMutation(CREATE_TASK_COMMENT);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createComment({
        variables: {
          taskId,
          ...newComment,
        },
      });
      setNewComment({ content: '', authorEmail: '' });
      refetch();
    } catch (err) {
      console.error('Error creating comment:', err);
    }
  };

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Comments</h3>

      {loading && <p className="text-gray-600">Loading comments...</p>}

      {!loading && (
        <div className="space-y-3 sm:space-y-4 mb-6">
          {data?.taskComments?.length === 0 ? (
            <p className="text-gray-500 text-sm">No comments yet</p>
          ) : (
            data?.taskComments?.map((comment: any) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <p className="text-sm sm:text-base text-gray-900 break-words">{comment.content}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span className="break-all">{comment.authorEmail}</span>
                  <span>•</span>
                  <span className="whitespace-nowrap">{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="label text-sm">Add a comment</label>
          <textarea
            required
            value={newComment.content}
            onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
            className="input text-sm sm:text-base"
            rows={3}
            placeholder="Write your comment..."
          />
        </div>
        <div>
          <label className="label text-sm">Your email</label>
          <input
            type="email"
            required
            value={newComment.authorEmail}
            onChange={(e) => setNewComment({ ...newComment, authorEmail: e.target.value })}
            className="input text-sm sm:text-base"
            placeholder="your@email.com"
          />
        </div>
        <Button type="submit" disabled={creating} className="btn-primary w-full sm:w-auto">
          {creating ? 'Posting...' : 'Post Comment'}
        </Button>
      </form>
    </div>
  );
};

export default TaskComments;
