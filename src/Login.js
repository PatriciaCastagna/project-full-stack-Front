import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import './Tarefas';


const Login = ({ setAuth }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Limpa erro anterior
        
        try {
            // Faz a requisição para a API de autenticação
            const response = await axios.post('http://localhost:3000/login', { email, senha: password});
            

            if (response.data.token) {
                localStorage.setItem('token', response.data.token); // Salva o token no localStorage
                
                setAuth(true); // Atualiza o estado de autenticação
                navigate('/tarefas'); // Redireciona para a página de tarefas
            } else {
                setError('Credenciais inválidas');
            }
        } catch (error) {
            setError('Erro de autenticação');
            console.error("Erro de autenticação", error);
        }
    };

    return (
        <div className="form">
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input 
                        type="email" 
                        id="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                </div>
                <div>
                    <label htmlFor="password">Senha:</label>
                    <input 
                        type="password" 
                        id="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                </div>
                <button type="submit">Entrar</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Login;
