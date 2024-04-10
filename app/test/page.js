
'use client'
export default function Login() {
    return (
      <div className="login-container">
        <div className="login-form">
          <h1>Login</h1>
          <div>
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" required />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit">Login</button>
          <div className="login-links">
            <a href="#">Forgot Password?</a>
            <a href="#">Sign Up</a>
          </div>
        </div>
        <style jsx>{`
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f2f5;
  }

  .login-form {
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  h1 {
    text-align: center;
  }

  div {
    margin-bottom: 12px;
  }

  label {
    display: block;
    margin-bottom: 8px;
  }

  input {
    width: 100%;
    padding: 8px;
    margin-bottom: 12px;
    border-radius: 4px;
    border: 1px solid #ccc;
  }

  button {
    width: 100%;
    padding: 10px;
    background-color: #0052cc;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background-color: #0041c4;
  }

  .login-links {
    text-align: center;
  }

  .login-links a {
    margin-right: 12px;
    color: #0056b3;
    text-decoration: none;
  }

  .login-links a:hover {
    text-decoration: underline;
  }
`}</style>
      </div>
    );
  }

  