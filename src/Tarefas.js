import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import './Tarefas.css';

const Tarefas = ({ setAuth }) => {
    const [tarefas, setTarefas] = useState([]);
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [editandoTarefa, setEditandoTarefa] = useState(null);
    const [loading, setLoading] = useState(true);

    const getToken = useCallback(() => {
        return localStorage.getItem('token');
    }, []);

    const getUsuarioId = useCallback(() => {
        const token = getToken();
        if (!token) return null;
        try {
            const decodedToken = jwtDecode(token);
            return decodedToken.userId || decodedToken.id; 
        } catch (error) {
            console.error('Erro ao decodificar token:', error);
            return null;
        }
    }, [getToken]);

    const handleAuthError = useCallback(() => {
        localStorage.removeItem('token');  // Remove o token
        setAuth(false);  // Desloga o usuário
    }, [setAuth]);

    const carregarTarefas = useCallback(async () => {
        try {
            const usuarioId = getUsuarioId();
            if (!usuarioId) {
                console.error('ID do usuário não encontrado.');
                handleAuthError();  // Se não há ID, desloga o usuário
                return;
            }

            const token = getToken();
            const response = await axios.get(`http://localhost:3000/usuarios/${usuarioId}/tarefas`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTarefas(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Erro ao carregar as tarefas:', error);
            if (error.response && error.response.status === 403) {
                handleAuthError();  // Se houver erro 403, desloga o usuário
            }
        }
    }, [getUsuarioId, getToken, handleAuthError]);

    useEffect(() => {
        carregarTarefas();
    }, [carregarTarefas]);

    const adicionarTarefa = async (e) => {
        e.preventDefault();
        try {
            const token = getToken();
            const response = await axios.post(
                'http://localhost:3000/tarefas',
                { titulo, descricao, concluida: false },  
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            
            setTarefas([...tarefas, { id: response.data.id, titulo, descricao, concluida: false }]); 
            setTitulo('');
            setDescricao('');
        } catch (error) {
            console.error('Erro ao adicionar tarefa:', error);
        }
    };

    const deletarTarefa = async (id) => {
        try {
            const token = getToken();
            await axios.delete(`http://localhost:3000/tarefas/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTarefas(tarefas.filter((tarefa) => tarefa.id !== id));
        } catch (error) {
            console.error('Erro ao deletar tarefa:', error);
            if (error.response && error.response.status === 403) {
                handleAuthError();
            }
        }
    };

    const editarTarefa = (tarefa) => {
        setEditandoTarefa(tarefa);
        setTitulo(tarefa.titulo);
        setDescricao(tarefa.descricao);
    };

    const atualizarTarefa = async (e) => {
        e.preventDefault();
        try {
            const token = getToken();
            await axios.put(
                `http://localhost:3000/tarefas/${editandoTarefa.id}`,
                { 
                    titulo, 
                    descricao, 
                    concluida: editandoTarefa.concluida
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            carregarTarefas(); // Atualiza a lista de tarefas após edição
            setTitulo('');
            setDescricao('');
            setEditandoTarefa(null); // Sai do modo de edição
        } catch (error) {
            console.error('Erro ao atualizar tarefa:', error);
            if (error.response && error.response.status === 403) {
                handleAuthError();
            }
        }
    };

    if (loading) {
        return <p>Carregando tarefas...</p>;
    }

    return (
        <div className='tarefas'>
            <h1>Suas Tarefas</h1>

            {/* Formulário para adicionar ou editar tarefa */}
            <form onSubmit={editandoTarefa ? atualizarTarefa : adicionarTarefa}>
                <div className='inpuTarefas'>
                    <input
                        type="text"
                        placeholder="Título"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="Descrição"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                    />
                </div>
                <button type="submit" className='buttonAdd'>
                    {editandoTarefa ? 'Atualizar Tarefa' : 'Adicionar Tarefa'}
                </button>
            </form>

            {/* Lista de tarefas */}
            <ul>
                {tarefas.length > 0 ? (
                    tarefas.map((tarefa) => (
                        <li key={tarefa.id}>
                            <h3>{tarefa.titulo}</h3>
                            <p>{tarefa.descricao}</p>
                            <div>
                                <button className='boteditar' onClick={() => editarTarefa(tarefa)}>Editar</button>
                                <button className='botdeletar'onClick={() => deletarTarefa(tarefa.id)}>Excluir</button>
                            </div>
                        </li>
                    ))
                ) : (
                    <p>Nenhuma tarefa encontrada.</p>
                )}
            </ul>
        </div>
    );
};

export default Tarefas;
