import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('sanchia_email');
    if (savedEmail) setEmail(savedEmail);
  }, []);

  useEffect(() => {
    if (email) localStorage.setItem('sanchia_email', email);
  }, [email]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Credenciales incorrectas. Intenta de nuevo.');
    } else {
      localStorage.setItem('sanchia_email', email);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        
        {/* PANEL IZQUIERDO */}
        <div className="login-left">
          <div className="login-logo-container">
            {/* LOGO PREMIUM: Escudo de Seguridad Industrial + Engranaje */}
            <svg className="login-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(234, 179, 8, 0.1)" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="11" r="3" stroke="#eab308" strokeWidth="2"/>
              <path d="M12 5v3M12 14v3M6 11h2M16 11h2" stroke="#eab308" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <h1>SANCHIA</h1>
          </div>
          
          <div className="login-welcome">
            <h2>Bienvenido</h2>
            <p>Sistema modular para la gestion, control y registro de seguridad industrial avanzada.</p>
          </div>
          
          <div className="login-footer">
            <p>INDUSTRIAS SANCHIA © 2026</p>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="login-right">
          <h3>SEGURIDAD INDUSTRIAL</h3>
          
          <form onSubmit={handleLogin} className="login-form">
            {error && <div className="login-error">{error}</div>}
            
            <div className="form-group">
              <label>Correo Electronico</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="ejemplo@sanchia.com" 
                required 
                autoComplete="email"
              />
            </div>
            
            <div className="form-group">
              <label>Contrasena</label>
              <div className="password-wrapper">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>
            
            <button type="submit" className="btn-login">
              Iniciar Sesion
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
}