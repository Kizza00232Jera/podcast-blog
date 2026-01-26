import { Home } from "./pages/Home";
import { Header } from "./components/Layout/Header";
import { PodcastProvider } from "./context/PodcastContext";
import "./styles/globals.css";

function App() {
  return (
    <PodcastProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Home />
      </div>
    </PodcastProvider>
  );
}

export default App;
