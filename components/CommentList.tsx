import ReportButton from './ReportButton';

interface Comment {
  id: string;
  supporterName: string | null;
  points: number;
  comment: string;
  createdAt: Date | string;
}

interface CommentListProps {
  comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        まだ応援コメントがありません。最初に応援してみましょう！
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map(c => (
        <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-medium text-sm text-gray-800">
                  {c.supporterName ?? '匿名の応援者'}
                </span>
                <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
                  {c.points}pt
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(c.createdAt).toLocaleDateString('ja-JP')}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{c.comment}</p>
            </div>
            <ReportButton targetType="support" targetId={c.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
