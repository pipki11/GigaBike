"use client";

import { useActionState, useState } from "react";
import { Icon } from "@gigabike/ui";
import { signIn, type LoginState } from "./actions";
import { makeAt, type AdminLocale } from "@/lib/i18n";

export function LoginForm({ locale }: { locale: AdminLocale }) {
  const at = makeAt(locale);
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});
  const [show, setShow] = useState(false);

  return (
    <form className="login-form" action={action}>
      <div className="fld">
        <label>{at("login.email")}</label>
        <input name="email" type="email" placeholder="email" autoFocus required />
      </div>
      <div className="fld">
        <label>{at("login.pw")}</label>
        <div className="pw-field">
          <input
            name="password"
            type={show ? "text" : "password"}
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            className="pw-toggle"
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
            aria-label={show ? "Hide password" : "Show password"}
          >
            <Icon name={show ? "eyeOff" : "eye"} />
          </button>
        </div>
      </div>
      {state.error === "creds" && (
        <div className="login-err">
          <Icon name="alert" />
          {at("login.err")}
        </div>
      )}
      {state.error === "noenv" && (
        <div className="login-err">
          <Icon name="alert" />
          {at("login.noenv")}
        </div>
      )}
      <button
        type="submit"
        className="btn btn-primary btn-lg"
        style={{ width: "100%", marginTop: 4 }}
        disabled={pending}
      >
        {at("login.signin")}
        <Icon name="logout" size={18} />
      </button>
    </form>
  );
}
