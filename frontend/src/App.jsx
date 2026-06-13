import './app.scss'
import Navbar from "./Componentes/Navbar.jsx";
import SideBar from "./Componentes/sideBar.jsx";
import {BrowserRouter as Router, Route} from "react-router-dom";
import carrito from "./pages/carrito.jsx";
import categorias from "./pages/categorias.jsx";
function App() {
  return (
    <Router>
      <Navbar />
        <div className="flex">
            <SideBar />
            <div className="content">
                <Route path="/categorias" exact={true} component={categorias}  />
                <Route path="/carrito" exact={true} component={carrito} />
            </div>
        </div>
    </Router>
  )
}

export default App
