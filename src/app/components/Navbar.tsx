"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Layout, Button, Space, Dropdown, Grid, Tooltip } from "antd";
import {
  FileTextOutlined,
  ApiOutlined,
  RocketOutlined,
  SearchOutlined,
  GlobalOutlined,
  LoginOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { uiActions, selectLang, selectThemeMode } from "@/app/store/slices/uiSlice";
import { authActions, selectToken, selectAuthUser } from "@/app/store/slices/authSlice";

import DocsModal from "./DocsModal";
import MegaMenuCatalog from "./MegaMenuCatalog";
import LoginModal from "./auth/LoginModal";

const { Header } = Layout;
const { useBreakpoint } = Grid;

export default function Navbar() {
  const { t } = useTranslation();

  const bp = useBreakpoint();
  const dispatch = useAppDispatch();

  const lang = useAppSelector(selectLang);
  const mode = useAppSelector(selectThemeMode);
  const token = useAppSelector(selectToken);
  const user = useAppSelector(selectAuthUser);

  const [openMega, setOpenMega] = React.useState(false);

  const [docFront, setDocFront] = React.useState(false);
  const [docBack, setDocBack] = React.useState(false);
  const [docDeploy, setDocDeploy] = React.useState(false);

  const isMobile = !bp.md;

  const userLabel =
    (user?.fullName && user.fullName.trim()) ? user.fullName : (user?.email ?? t("nav.login"));

  const DocsButtons = (
    <Space>
      <Button icon={<FileTextOutlined />} onClick={() => setDocFront(true)}>
        {t("nav.docsFront")}
      </Button>
      <Button icon={<ApiOutlined />} onClick={() => setDocBack(true)}>
        {t("nav.docsBack")}
      </Button>
      <Button icon={<RocketOutlined />} onClick={() => setDocDeploy(true)}>
        {t("nav.deploy")}
      </Button>
    </Space>
  );

  const RightActions = (
    <Space>
      <Tooltip title={t("nav.search")}>
        <Button icon={<SearchOutlined />} onClick={() => setOpenMega(true)} />
      </Tooltip>

      <Tooltip title={t("nav.language")}>
        <Button icon={<GlobalOutlined />} onClick={() => dispatch(uiActions.toggleLang())}>
          {lang.toUpperCase()}
        </Button>
      </Tooltip>

      <Tooltip title={`${t("nav.theme")}: ${mode === "dark" ? t("nav.dark") : t("nav.light")}`}>
        <Button onClick={() => dispatch(uiActions.toggleTheme())}>
          {mode === "dark" ? t("nav.dark") : t("nav.light")}
        </Button>
      </Tooltip>

      {token ? (
        <Space>
          <Tooltip title={user?.email ?? ""}>
            <Space style={{ padding: "0 6px", fontWeight: 600 }}>
              <UserOutlined />
              <span>{userLabel}</span>
            </Space>
          </Tooltip>

          <Button icon={<LogoutOutlined />} danger onClick={() => dispatch(authActions.logout())}>
            {t("nav.logout")}
          </Button>
        </Space>
      ) : (
        <Button icon={<LoginOutlined />} type="primary" onClick={() => dispatch(uiActions.openLogin())}>
          {t("nav.login")}
        </Button>
      )}
    </Space>
  );

  const mobileMenu = (
    <Dropdown
      menu={{
        items: [
          ...(token
            ? [
                { key: "user", icon: <UserOutlined />, label: userLabel, disabled: true },
                { type: "divider" as const },
              ]
            : []),

          { key: "front", icon: <FileTextOutlined />, label: t("nav.docsFront"), onClick: () => setDocFront(true) },
          { key: "back", icon: <ApiOutlined />, label: t("nav.docsBack"), onClick: () => setDocBack(true) },
          { key: "deploy", icon: <RocketOutlined />, label: t("nav.deploy"), onClick: () => setDocDeploy(true) },
          { type: "divider" as const },

          { key: "mega", icon: <SearchOutlined />, label: t("nav.search"), onClick: () => setOpenMega(true) },
          { key: "lang", icon: <GlobalOutlined />, label: `${t("nav.language")}: ${lang.toUpperCase()}`, onClick: () => dispatch(uiActions.toggleLang()) },
          { key: "theme", label: `${t("nav.theme")}: ${mode === "dark" ? t("nav.dark") : t("nav.light")}`, onClick: () => dispatch(uiActions.toggleTheme()) },

          token
            ? { key: "logout", icon: <LogoutOutlined />, label: t("nav.logout"), onClick: () => dispatch(authActions.logout()) }
            : { key: "login", icon: <LoginOutlined />, label: t("nav.login"), onClick: () => dispatch(uiActions.openLogin()) },
        ],
      }}
      trigger={["click"]}
    >
      <Button icon={<MenuOutlined />} />
    </Dropdown>
  );

  return (
    <>
      <Header className="topbar">
        <div className="topbar-left">{isMobile ? mobileMenu : DocsButtons}</div>

        <div className="topbar-center">
          <Link href="/productos" className="logo-link" aria-label={t("nav.goProducts")}>
            <Image
              src="/logo.png"
              alt="Company Logo"
              width={170}
              height={44}
              priority
              style={{ objectFit: "contain" }}
            />
          </Link>
        </div>

        <div className="topbar-right">{isMobile ? null : RightActions}</div>
      </Header>

      <div className="subnav">
        <Space wrap>
          <Link href="/productos">
            <Button>{t("nav.products")}</Button>
          </Link>
          <Link href="/categorias">
            <Button>{t("nav.categories")}</Button>
          </Link>
        </Space>
      </div>

      <MegaMenuCatalog open={openMega} onClose={() => setOpenMega(false)} />

      <DocsModal open={docFront} onClose={() => setDocFront(false)} title={t("docs.frontTitle")} mdUrl="/docs/front.md" />
      <DocsModal open={docBack} onClose={() => setDocBack(false)} title={t("docs.backTitle")} mdUrl="/docs/back.md" />
      <DocsModal open={docDeploy} onClose={() => setDocDeploy(false)} title={t("docs.deployTitle")} mdUrl="/docs/deploy.md" />

      <LoginModal />
    </>
  );
}
