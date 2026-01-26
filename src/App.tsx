import { Header } from "./components/Layout/Header";
import { PodcastList } from "./components/Podcast/PodcastList";
import { PodcastProvider } from "./context/PodcastContext";

function App() {
  return (
    <PodcastProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PodcastList />
        </div>
      </div>
    </PodcastProvider>
  );
}

export default App;
