"use client";

import React from "react";
import { Card, Space, Button, Table, Input, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  fetchCategorias,
  selectCategorias,
  selectCategoriasLoading,
} from "@/app/store/slices/categoriasSlice";
import { uiActions } from "@/app/store/slices/uiSlice";
import { selectToken } from "@/app/store/slices/authSlice";

import CategoriaFormModal from "@/app/components/categorias/CategoriaFormModal";
import { showError } from "@/app/lib/alerts";
import type { CategoriaDto } from "@/app/types/api";

export default function CategoriasPage() {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const token = useAppSelector(selectToken);

  const data = useAppSelector(selectCategorias);
  const loading = useAppSelector(selectCategoriasLoading);

  const [openForm, setOpenForm] = React.useState(false);
  const [editItem, setEditItem] = React.useState<CategoriaDto | null>(null);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (!token) return;
    dispatch(fetchCategorias({ includeInactive: true, search: null })).catch((e) =>
      showError(t("errors.genericTitle"), e)
    );
  }, [dispatch, token, t]);

  const columns: ColumnsType<CategoriaDto> = [
    { title: t("common.id"), dataIndex: "idCategoria", width: 90 },
    { title: t("common.name"), dataIndex: "nombre" },
    { title: t("common.description"), dataIndex: "descripcion" },
    {
      title: t("common.active"),
      dataIndex: "activo",
      width: 110,
      render: (v) =>
        v ? (
          <Tag color="green">{t("common.yes")}</Tag>
        ) : (
          <Tag color="red">{t("common.no")}</Tag>
        ),
    },
    {
      title: t("common.actions"),
      key: "actions",
      width: 170,
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setEditItem(r);
              setOpenForm(true);
            }}
          >
            {t("common.edit")}
          </Button>

          <Button
            size="small"
            danger
            onClick={() => dispatch(uiActions.openDeleteCategoria(r.idCategoria))}
          >
            {t("common.delete")}
          </Button>
        </Space>
      ),
    },
  ];

  const filtered = !search.trim()
    ? data
    : data.filter((c) =>
        `${c.nombre ?? ""} ${c.descripcion ?? ""}`.toLowerCase().includes(search.toLowerCase())
      );

  if (!token) {
    return (
      <Card>
        <h2>{t("categories.title")}</h2>
        <p>{t("auth.needTokenTitle")}</p>
        <Button type="primary" onClick={() => dispatch(uiActions.openLogin())}>
          {t("auth.login")}
        </Button>
      </Card>
    );
  }

  return (
    <>
      <Card
        title={t("categories.title")}
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => dispatch(fetchCategorias({ includeInactive: true, search: null }))}
            >
              {t("common.refresh")}
            </Button>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditItem(null);
                setOpenForm(true);
              }}
            >
              {t("common.new")}
            </Button>
          </Space>
        }
      >
        <Space style={{ marginBottom: 12 }}>
          <Input
            style={{ width: 320 }}
            placeholder={t("common.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
        </Space>

        <Table
          rowKey="idCategoria"
          loading={loading}
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <CategoriaFormModal open={openForm} onClose={() => setOpenForm(false)} initial={editItem} />
    </>
  );
}
