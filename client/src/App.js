import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import RecipeInput from './pages/RecipeInput';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/' element={<RecipeInput />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
