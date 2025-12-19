import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ErrorBoundary } from './ErrorBoundary';
import { Onboarding } from './pages/Onboarding/Onboarding';
import { TagSelection } from './pages/TagSelection/TagSelection';
import { AddressProfile } from './pages/AddressProfile/AddressProfile';
import { InfoFeed } from './pages/InfoFeed/InfoFeed';


// 受保护的路由组件（支持观察模式）
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isConnected } = useAccount();
  
  // 检查是否有观察地址参数
  const searchParams = new URLSearchParams(window.location.search);
  const hasWatchAddress = searchParams.has('address');
  
  // 如果已连接或有观察地址，允许访问
  return isConnected || hasWatchAddress ? <>{children}</> : <Navigate to="/" replace />;
};

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route
            path="/tag-selection"
            element={
              <ProtectedRoute>
                <TagSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AddressProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <InfoFeed />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;





