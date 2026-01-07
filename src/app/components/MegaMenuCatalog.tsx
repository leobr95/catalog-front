"use client";

import React from "react";
import Link from "next/link";
import { Drawer, Tabs, Input, List, Typography, Space, Tag, Skeleton } from "antd";
import { SearchOutlined, FolderOpenOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { useDebounce } from "@/app/lib/useDebounce";
import { request } from "@/app/lib/api";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { selectToken } from "@/app/store/slices/authSlice";
import { fetchCategorias, selectCategorias } from "@/app/store/slices/categoriasSlice";
import { productosActions } from "@/app/store/slices/productosSlice";

import type { CategoriaDto, PagedResponse, ProductoListItemDto } from "@/app/types/api";

type Props = { open: boolean; onClose: () => void };

export default function MegaMenuCatalog({ open, onClose }: Props) {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const token = useAppSelector(selectToken);
  const categorias = useAppSelector(selectCategorias);

  const [q, setQ] = React.useState("");
  const dq = useDebounce(q, 250);

  const [loading, setLoading] = React.useState(false);
  const [catRes, setCatRes] = React.useState<CategoriaDto[]>([]);
  const [prodRes, setProdRes] = React.useState<ProductoListItemDto[]>([]);

  React.useEffect(() => {
    if (!open) return;
    dispatch(fetchCategorias({ includeInactive: false, search: null }));
  }, [open, dispatch]);

  React.useEffect(() => {
    if (!open) return;
    if (!token) return;

    const run = async () => {
      const term = (dq ?? "").trim();
      if (!term) {
        setCatRes([]);
        setProdRes([]);
        return;
      }

      setLoading(true);
      try {
        const cats = await request<CategoriaDto[]>(
          `/api/categorias?includeInactive=false&search=${encodeURIComponent(term)}`,
          { token, method: "GET" }
        );

        const prods = await request<PagedResponse<ProductoListItemDto>>(
          `/api/productos?page=1&pageSize=10&search=${encodeURIComponent(
            term
          )}&sortBy=fechaCreacion&sortDir=desc`,
          { token, method: "GET" }
        );

        setCatRes(cats ?? []);
        setProdRes(prods?.items ?? []);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [dq, open, token]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="top"
      // ✅ height está deprecado en AntD: usar size + styles.wrapper
      size="large"
      styles={{ wrapper: { height: "88vh" } }}
      title={
        <Space>
          <SearchOutlined />
          <span>{t("products.megaMenuTitle")}</span>
        </Space>
      }
    >
      <Tabs
        items={[
          {
            key: "cats",
            label: t("products.tabCategories"),
            children: (
              <List
                dataSource={categorias}
                renderItem={(c) => (
                  <List.Item>
                    <Space>
                      <FolderOpenOutlined />
                      <Typography.Text strong>{c.nombre}</Typography.Text>

                      {c.activo ? (
                        <Tag color="green">{t("common.active")}</Tag>
                      ) : (
                        <Tag color="red">{t("common.no")}</Tag>
                      )}

                      <Typography.Text type="secondary">#{c.idCategoria}</Typography.Text>

                      <Link href={`/productos?idCategoria=${c.idCategoria}`} onClick={onClose}>
                        {t("products.viewProducts")}
                      </Link>
                    </Space>
                  </List.Item>
                )}
              />
            ),
          },
          {
            key: "search",
            label: t("products.tabSearch"),
            children: (
              <>
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("products.typeToSearch")}
                  prefix={<SearchOutlined />}
                  allowClear
                />

                <div style={{ height: 12 }} />

                {loading ? (
                  <Skeleton active />
                ) : (
                  <div className="mega-grid">
                    <div className="mega-col">
                      <Typography.Title level={5} style={{ marginTop: 0 }}>
                        {t("products.tabCategories")}
                      </Typography.Title>

                      <List
                        dataSource={catRes}
                        locale={{
                          emptyText: dq.trim() ? t("products.emptyNoMatches") : t("products.typeToSearch"),
                        }}
                        renderItem={(c) => (
                          <List.Item>
                            <Space>
                              <FolderOpenOutlined />
                              <Link
                                href={`/productos?idCategoria=${c.idCategoria}`}
                                onClick={() => {
                                  dispatch(
                                    productosActions.setQuery({
                                      page: 1,
                                      pageSize: 10,
                                      search: null,
                                      idCategoria: c.idCategoria,
                                      precioMin: null,
                                      precioMax: null,
                                      activo: null,
                                      sortBy: "fechaCreacion",
                                      sortDir: "desc",
                                    })
                                  );
                                  onClose();
                                }}
                              >
                                {c.nombre}
                              </Link>
                            </Space>
                          </List.Item>
                        )}
                      />
                    </div>

                    <div className="mega-col">
                      <Typography.Title level={5} style={{ marginTop: 0 }}>
                        {t("products.title")}
                      </Typography.Title>

                      <List
                        dataSource={prodRes}
                        locale={{
                          emptyText: dq.trim()
                            ? t("products.noProductsFor", { term: dq })
                            : t("products.typeToSearch"),
                        }}
                        renderItem={(p) => (
                          <List.Item>
                            <Space style={{ width: "100%", justifyContent: "space-between" }}>
                              <Space>
                                <ShoppingOutlined />
                                <Typography.Text strong>{p.nombre}</Typography.Text>
                                {!!p.sku && <Typography.Text type="secondary">{p.sku}</Typography.Text>}
                              </Space>

                              <Link href="/productos" onClick={onClose}>
                                {t("common.open")}
                              </Link>
                            </Space>
                          </List.Item>
                        )}
                      />
                    </div>
                  </div>
                )}
              </>
            ),
          },
        ]}
      />
    </Drawer>
  );
}
