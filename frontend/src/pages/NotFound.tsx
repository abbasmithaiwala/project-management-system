import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

interface NotFoundProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  backPath?: string;
}

const NotFound = ({
  title = '404 - Not Found',
  message = 'The resource you are looking for does not exist.',
  showBackButton = true,
  backPath,
}: NotFoundProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6">
        <div className="card text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          {showBackButton && (
            <div className="flex gap-3 justify-center">
              <Button onClick={handleBack} variant="primary">
                Go Back
              </Button>
              <Button onClick={() => navigate('/')} variant="secondary">
                Go Home
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
