import React, { useContext } from "react";
import AuthContext from "../context/AuthContext";

const LoginPage = () => {
    let { loginUser } = useContext(AuthContext);

    return (
        <div>
            <form onSubmit={loginUser}>
                <h2>Login</h2>
                <input type={"text"} name="email" placeholder="Email"></input>
                <input type={"password"} name="password" placeholder="Password"></input>
                <input type={"submit"} value={"Login"} />
            </form>
        </div>
    );
};

export default LoginPage;
