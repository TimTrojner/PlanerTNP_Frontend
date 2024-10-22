import axios from 'axios';
import sha256 from 'crypto-js/sha256';
import Cookie from "js-cookie";
import React, { useState } from 'react';
import { useNavigate } from "react-router";
import env from "../../env.json";
import './login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    // Handle login logic here
    var ee = sha256(password).toString();
    console.log(ee);
    console.log('Email:', email);
    console.log('Password:', password);

    const data = {
      Email: email,
      Password: sha256(password).toString()
    };

    const response = await axios.post(`${env.api}/users/login`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).catch((error) => {
      console.log('Error:', error);
      alert('Wrong email or password');
    });

    console.log('Response:', response);
    if (response !== undefined && response.status !== 400) {
      Cookie.set("signed_in_user", response.data);
      navigate("/");
      window.location.reload();
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <div className="login-form">
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button" onClick={handleSubmit}>Login</button>
      </div>
    </div>
  );
}

export default Login;