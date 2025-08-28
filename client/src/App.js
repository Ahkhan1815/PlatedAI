import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import RecipeInput from './pages/RecipeInput';
import 'bootstrap/dist/css/bootstrap.min.css'

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
