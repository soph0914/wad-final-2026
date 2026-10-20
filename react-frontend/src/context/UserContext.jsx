//src/context/UseContext.jsx

import { createContext, useEffect, useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // The backend sets an httpOnly cookie on login. The token is also kept so
  // it can be sent as a Bearer header for browsers that block third-party
  // cookies (frontend and backend live on different domains).
  const tokenRef = useRef(localStorage.getItem("token"));

  // fetch wrapper: sends cookie + token, parses JSON, throws on error.
  async function api(path, { method = "GET", body } = {}) {
    const headers = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (tokenRef.current) headers["Authorization"] = `Bearer ${tokenRef.current}`;

    let res;
    try {
      res = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        credentials: "include",
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw new Error("Cannot reach the server. Please try again.");
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      // Session expired or invalid: go back to the login page.
      if (res.status === 401 && !path.startsWith("/api/auth/login")) {
        clearSession();
      }
      const error = new Error(data.message || `Request failed (${res.status})`);
      error.status = res.status;
      throw error;
    }
    return data;
  }

  function clearSession() {
    tokenRef.current = null;
    localStorage.removeItem("token");
    setUser(null);
  }

  async function login(identifier, password) {
    const data = await api("/api/auth/login", {
      method: "POST",
      body: { identifier, password },
    });
    tokenRef.current = data.token;
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore: the local session is cleared either way
    }
    clearSession();
  }

  // Restore the session after a page refresh.
  useEffect(() => {
    let active = true;
    api("/api/user")
      .then((me) => active && setUser(me))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, login, logout, api }}>
      {children}
    </UserContext.Provider>
  );
}
