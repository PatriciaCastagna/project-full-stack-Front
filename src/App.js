import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import Tarefas from './Tarefas';

const App = () => {
    const [auth, setAuth] = useState(false);

    // Verifica se há um token no localStorage para manter o usuário autenticado
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setAuth(true);
        }
    }, []);

    return (
        <Router>
            <Routes>
                {/* Redireciona o caminho raiz para o login */}
                <Route path="/" element={<Navigate to="/login" />} />
                
                {/* Rota de login */}
                <Route path="/login" element={<Login setAuth={setAuth} />} />
                
                {/* Rota para tarefas */}
                <Route 
                    path="/tarefas" 
                    element={auth ? <Tarefas setAuth={setAuth} /> : <Navigate to="/login" />} 
                />
            </Routes>
        </Router>
    );
};

export default App;



