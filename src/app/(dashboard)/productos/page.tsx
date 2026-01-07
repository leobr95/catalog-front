"use client";

import React from "react";
import { Suspense } from "react";
import { Card, Space, Button, Table, Input, Select, InputNumber, Tag, Skeleton } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { TableProps } from "antd";
import { PlusOutlined, UploadOutlined, ReloadOutlined } from "@ant-design/icons";
import { useSearchParams, useRouter } from "next/navigation";
// Si usas i18n en esta página, puedes dejarlo:
// import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  fetchProductos,
  productosActions,
  selectProductos,
  selectProductosLoading,
  selectProductosQuery,
} from "@/app/store/slices/productosSlice";
import { fetchCategorias, selectCategorias } from "@/app/store/slices/categoriasSlice";
import { uiActions } from "@/app/store/slices/uiSlice";
import { selectToken } from "@/app/store/slices/authSlice";

import ProductoFormModal from "@/app/components/productos/ProductoFormModal";
import BulkImportModal from "@/app/components/productos/BulkImportModal";

import { showError } from "@/app/lib/alerts";
import type { ProductoListItemDto } from "@/app/types/api";

function ProductosInner() {
  // Si usas i18n en esta página:
  // const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const router = useRouter();
  const sp = useSearchParams(); // ✅ AHORA está dentro de Suspense

  const token = useAppSelector(selectToken);

  const categorias = useAppSelector(selectCategorias);
  const data = useAppSelector(selectProductos);
  const loading = useAppSelector(selectProductosLoading);
  const query = useAppSelector(selectProductosQuery);

  const [openForm, setOpenForm] = React.useState(false);
  const [editItem, setEditItem] = React.useState<ProductoListItemDto | null>(null);
  const [openImport, setOpenImport] = React.useState(false);

  // Hydrate query from URL (search, idCategoria)
  React.useEffect(() => {
    const urlSearch = sp.get("search") ?? "";
    const urlCat = sp.get("idCategoria");
    const idCategoria = urlCat ? Number(urlCat) : undefined;

    dispatch(
      productosActions.setQuery({
        ...query,
        page: 1,
        search: urlSearch || null,
        idCategoria: Number.isFinite(idCategoria) ? (idCategoria as number) : null,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    dispatch(fetchCategorias({ includeInactive: true, search: null }));
  }, [dispatch]);

  React.useEffect(() => {
    if (!token) return;
    dispatch(fetchProductos()).catch((e) => showError("Error", e));
  }, [
    dispatch,
    token,
    query.page,
    query.pageSize,
    query.search,
    query.idCategoria,
    query.precioMin,
    query.precioMax,
    query.activo,
    query.sortBy,
    query.sortDir,
  ]);

  const columns: ColumnsType<ProductoListItemDto> = [
    { title: "ID", dataIndex: "idProducto", width: 90 },
    {
      title: "SKU",
      dataIndex: "sku",
      width: 140,
      render: (v) => (typeof v === "string" && v.trim() ? v : <span style={{ opacity: 0.6 }}>—</span>),
    },
    { title: "Nombre", dataIndex: "nombre" },
    {
      title: "Precio",
      dataIndex: "precio",
      width: 140,
      render: (v) => (typeof v === "number" ? v.toLocaleString("es-CO") : v),
      sorter: true,
    },
    { title: "Stock", dataIndex: "stock", width: 120, sorter: true },
    {
      title: "Activo",
      dataIndex: "activo",
      width: 110,
      render: (v) => (v ? <Tag color="green">Sí</Tag> : <Tag color="red">No</Tag>),
    },
    {
      title: "Acciones",
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
            Editar
          </Button>

          <Button size="small" danger onClick={() => dispatch(uiActions.openDeleteProducto(r.idProducto))}>
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  const onTableChange: TableProps<ProductoListItemDto>["onChange"] = (pagination, _filters, sorter) => {
    const nextPage = pagination.current ?? 1;
    const nextSize = pagination.pageSize ?? 10;

    let sortBy = query.sortBy;
    let sortDir = query.sortDir;

    const s = Array.isArray(sorter) ? sorter[0] : sorter;

    if (s?.field) {
      const field = String(s.field);

      if (field === "precio") sortBy = "precio";
      if (field === "stock") sortBy = "stock";

      if (s.order === "ascend") sortDir = "asc";
      else if (s.order === "descend") sortDir = "desc";
    }

    dispatch(
      productosActions.setQuery({
        ...query,
        page: nextPage,
        pageSize: nextSize,
        sortBy,
        sortDir,
      })
    );
  };

  const categoriaOptions = [
    { label: "Todas", value: "ALL" },
    ...categorias.map((c) => ({
      label: `${c.nombre} (#${c.idCategoria})`,
      value: String(c.idCategoria),
    })),
  ];

  if (!token) {
    return (
      <Card>
        <h2>Productos</h2>
        <p>Necesitas generar un token JWT para consumir la API (demo).</p>
        <Button type="primary" onClick={() => dispatch(uiActions.openLogin())}>
          Generar token
        </Button>
      </Card>
    );
  }

  return (
    <>
      <Card
        title="Productos"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => dispatch(fetchProductos())}>
              Refrescar
            </Button>
            <Button icon={<UploadOutlined />} onClick={() => setOpenImport(true)}>
              Importar (CSV/XLSX)
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditItem(null);
                setOpenForm(true);
              }}
            >
              Nuevo
            </Button>
          </Space>
        }
      >
        <Space wrap style={{ marginBottom: 12 }}>
          <Input
            style={{ width: 260 }}
            placeholder="Buscar…"
            value={query.search ?? ""}
            onChange={(e) =>
              dispatch(productosActions.setQuery({ ...query, page: 1, search: e.target.value || null }))
            }
            allowClear
          />

          <Select
            style={{ width: 260 }}
            value={query.idCategoria ? String(query.idCategoria) : "ALL"}
            options={categoriaOptions}
            onChange={(v) => {
              const id = v === "ALL" ? null : Number(v);
              dispatch(
                productosActions.setQuery({
                  ...query,
                  page: 1,
                  idCategoria: Number.isFinite(id) ? id : null,
                })
              );
              router.replace(`/productos?idCategoria=${v === "ALL" ? "" : v}`);
            }}
          />

          <InputNumber
            style={{ width: 160 }}
            placeholder="Precio mín"
            value={query.precioMin ?? undefined}
            min={0}
            onChange={(v) =>
              dispatch(productosActions.setQuery({ ...query, page: 1, precioMin: typeof v === "number" ? v : null }))
            }
          />

          <InputNumber
            style={{ width: 160 }}
            placeholder="Precio máx"
            value={query.precioMax ?? undefined}
            min={0}
            onChange={(v) =>
              dispatch(productosActions.setQuery({ ...query, page: 1, precioMax: typeof v === "number" ? v : null }))
            }
          />

          <Select
            style={{ width: 160 }}
            value={query.activo === null ? "ALL" : query.activo ? "true" : "false"}
            options={[
              { label: "Todos", value: "ALL" },
              { label: "Activos", value: "true" },
              { label: "Inactivos", value: "false" },
            ]}
            onChange={(v) => {
              const activo = v === "ALL" ? null : v === "true";
              dispatch(productosActions.setQuery({ ...query, page: 1, activo }));
            }}
          />

          <Select
            style={{ width: 180 }}
            value={query.sortBy}
            options={[
              { label: "Fecha creación", value: "fechaCreacion" },
              { label: "Nombre", value: "nombre" },
              { label: "Precio", value: "precio" },
            ]}
            onChange={(v) => dispatch(productosActions.setQuery({ ...query, page: 1, sortBy: v }))}
          />

          <Select
            style={{ width: 140 }}
            value={query.sortDir}
            options={[
              { label: "Desc", value: "desc" },
              { label: "Asc", value: "asc" },
            ]}
            onChange={(v) => dispatch(productosActions.setQuery({ ...query, page: 1, sortDir: v }))}
          />
        </Space>

        <Table
          rowKey="idProducto"
          loading={loading}
          columns={columns}
          dataSource={data.items}
          pagination={{
            current: data.page,
            pageSize: data.pageSize,
            total: data.total,
            showSizeChanger: true,
          }}
          onChange={onTableChange}
        />
      </Card>

      <ProductoFormModal open={openForm} onClose={() => setOpenForm(false)} categorias={categorias} initial={editItem} />
      <BulkImportModal open={openImport} onClose={() => setOpenImport(false)} />
    </>
  );
}

export default function ProductosPage() {
  return (
    <Suspense
      fallback={
        <Card title="Productos">
          <Skeleton active />
        </Card>
      }
    >
      <ProductosInner />
    </Suspense>
  );
}
