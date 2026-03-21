import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useContext, useEffect } from 'react';
import RecipeInput from './pages/RecipeInput';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import 'bootstrap/dist/css/bootstrap.min.css'
import Header from './components/Header';
import AuthContext from './contexts/AuthContext';
import { NavigationGuardProvider } from './contexts/NavigationGuardContext';

function App() {
  const { user, authLoading } = useContext(AuthContext)

  useEffect(() => {
    if (!authLoading) return
    const userTheme = user?.theme_preference
    const persistedTheme = localStorage.getItem('plated-theme') || 'light'
    const effectiveTheme = userTheme || persistedTheme

    document.documentElement.setAttribute('data-bs-theme', effectiveTheme)
    localStorage.setItem('plated-theme', effectiveTheme)
  }, [user, authLoading]);

  return (
    <div className="App">
      <Router>
        <NavigationGuardProvider>
          <Header />
          <Routes>
            <Route path='/recipeGenerator' element={<RecipeInput />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/settings' element={<Settings />} />
          </Routes>
        </NavigationGuardProvider>
      </Router>
    </div>
  );
}

export default App;
