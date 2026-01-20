import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import RecipeInput from './pages/RecipeInput';
import 'bootstrap/dist/css/bootstrap.min.css'
import Header from './components/Header';

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <Routes>
          <Route path='/recipeGenerator' element={<RecipeInput />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
