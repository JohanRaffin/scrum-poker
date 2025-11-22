import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RoomProvider } from './contexts/RoomContext';
import { Home } from './pages/Home';
import { Room } from './pages/Room';

function App() {
  return (
    <RoomProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:roomCode" element={<Room />} />
        </Routes>
      </Router>
    </RoomProvider>
  );
}

export default App;
