"use client";

import React from "react";
import { Modal, Tabs, Form, Input, Button, Space, Typography } from "antd";

import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { uiActions, selectLang } from "@/app/store/slices/uiSlice";
import { loginThunk, registerThunk, selectAuthLoading } from "@/app/store/slices/authSlice";
import { toastSuccess, showError } from "@/app/lib/alerts";

type TabKey = "login" | "register";

function useTexts(lang: "es" | "en") {
  if (lang === "en") {
    return {
      title: "Account",
      login: "Sign in",
      register: "Create account",
      email: "Email",
      password: "Password",
      fullName: "Full name",
      cancel: "Cancel",
      submitLogin: "Sign in",
      submitRegister: "Register",
      emailReq: "Email is required",
      passReq: "Password is required",
      nameReq: "Full name is required",
      hint: "Use your Auth API (localhost:5267) to get the token used by Catalog API.",
    };
  }
  return {
    title: "Cuenta",
    login: "Iniciar sesión",
    register: "Registrarse",
    email: "Correo",
    password: "Contraseña",
    fullName: "Nombre completo",
    cancel: "Cancelar",
    submitLogin: "Entrar",
    submitRegister: "Crear cuenta",
    emailReq: "Correo requerido",
    passReq: "Contraseña requerida",
    nameReq: "Nombre completo requerido",
    hint: "Se usa tu Auth API (localhost:5267) para obtener el token que consume el Catálogo.",
  };
}

export default function LoginModal() {
  const dispatch = useAppDispatch();
  const lang = useAppSelector(selectLang);
  const t = useTexts(lang);

  const open = useAppSelector((s) => s.ui.loginOpen);
  const loading = useAppSelector(selectAuthLoading);

  const [tab, setTab] = React.useState<TabKey>("login");
  const [loginForm] = Form.useForm<{ email: string; password: string }>();
  const [regForm] = Form.useForm<{ email: string; password: string; fullName: string }>();

  React.useEffect(() => {
    if (!open) return;
    setTab("login");

    // ✅ ahora NO da warning porque los Forms estarán montados (forceRender en Tabs)
    loginForm.resetFields();
    regForm.resetFields();
  }, [open, loginForm, regForm]);

  const close = () => dispatch(uiActions.closeLogin());

  return (
    <Modal
      open={open}
      onCancel={close}
      footer={null}
      title={t.title}
      // ✅ destroyOnClose deprecated
      destroyOnHidden
    >
      <Typography.Paragraph type="secondary" style={{ marginTop: -6 }}>
        {t.hint}
      </Typography.Paragraph>

      <Tabs
        activeKey={tab}
        onChange={(k) => setTab(k as TabKey)}
        items={[
          {
            key: "login",
            label: t.login,
            // ✅ asegura que el Form se monte aunque el tab no esté activo
            forceRender: true,
            children: (
              <Form
                form={loginForm}
                layout="vertical"
                onFinish={async (v) => {
                  try {
                    await dispatch(loginThunk({ email: v.email, password: v.password })).unwrap();
                    toastSuccess(lang === "es" ? "Sesión iniciada" : "Signed in");
                    close();
                  } catch (e) {
                    showError(lang === "es" ? "Error iniciando sesión" : "Sign in error", e);
                  }
                }}
              >
                <Form.Item name="email" label={t.email} rules={[{ required: true, message: t.emailReq }]}>
                  <Input autoComplete="email" />
                </Form.Item>

                <Form.Item name="password" label={t.password} rules={[{ required: true, message: t.passReq }]}>
                  <Input.Password autoComplete="current-password" />
                </Form.Item>

                <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                  <Button onClick={close}>{t.cancel}</Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    {t.submitLogin}
                  </Button>
                </Space>
              </Form>
            ),
          },
          {
            key: "register",
            label: t.register,
            // ✅ asegura que el Form se monte aunque el tab no esté activo
            forceRender: true,
            children: (
              <Form
                form={regForm}
                layout="vertical"
                onFinish={async (v) => {
                  try {
                    await dispatch(
                      registerThunk({
                        email: v.email,
                        password: v.password,
                        fullName: v.fullName,
                      })
                    ).unwrap();
                    toastSuccess(lang === "es" ? "Cuenta creada" : "Account created");
                    close();
                  } catch (e) {
                    showError(lang === "es" ? "Error registrando" : "Register error", e);
                  }
                }}
              >
                <Form.Item name="fullName" label={t.fullName} rules={[{ required: true, message: t.nameReq }]}>
                  <Input autoComplete="name" />
                </Form.Item>

                <Form.Item name="email" label={t.email} rules={[{ required: true, message: t.emailReq }]}>
                  <Input autoComplete="email" />
                </Form.Item>

                <Form.Item name="password" label={t.password} rules={[{ required: true, message: t.passReq }]}>
                  <Input.Password autoComplete="new-password" />
                </Form.Item>

                <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                  <Button onClick={close}>{t.cancel}</Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    {t.submitRegister}
                  </Button>
                </Space>
              </Form>
            ),
          },
        ]}
      />
    </Modal>
  );
}
