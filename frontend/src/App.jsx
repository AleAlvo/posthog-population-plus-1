import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import MapView from './components/MapView';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen w-screen">
        <MapView />
      </div>
    </QueryClientProvider>
  );
}

export default App;
