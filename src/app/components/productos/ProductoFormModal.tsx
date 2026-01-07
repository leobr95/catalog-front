"use client";

import React from "react";
import { Modal, Form, Input, InputNumber, Select, Switch, Button, Space } from "antd";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "@/app/store/hooks";
import { createProducto, updateProducto } from "@/app/store/slices/productosSlice";
import { toastSuccess, showError } from "@/app/lib/alerts";
import type { CategoriaDto, ProductoListItemDto, ProductoCreateUpdateDto } from "@/app/types/api";

type Props = {
  open: boolean;
  onClose: () => void;
  categorias: CategoriaDto[];
  initial: ProductoListItemDto | null;
};

type ProductoFormValues = Omit<ProductoCreateUpdateDto, "idCategoria"> & { idCategoria?: number };

function getSafeNumber(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function pickOptionalString(obj: unknown, key: string): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  const rec = obj as Record<string, unknown>;
  const v = rec[key];
  return typeof v === "string" ? v : undefined;
}

function pickOptionalNumber(obj: unknown, key: string): number | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  const rec = obj as Record<string, unknown>;
  const v = rec[key];
  return getSafeNumber(v);
}

function pickOptionalBoolean(obj: unknown, key: string): boolean | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  const rec = obj as Record<string, unknown>;
  const v = rec[key];
  return typeof v === "boolean" ? v : undefined;
}

export default function ProductoFormModal({ open, onClose, categorias, initial }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm<ProductoFormValues>();

  const initialIdProducto =
    pickOptionalNumber(initial, "idProducto") ?? pickOptionalNumber(initial, "id");

  const isEdit = typeof initialIdProducto === "number";

  React.useEffect(() => {
    if (!open) return;

    form.resetFields();

    const initialDescripcion = pickOptionalString(initial, "descripcion") ?? "";
    const initialIdCategoria =
      pickOptionalNumber(initial, "idCategoria") ?? pickOptionalNumber(initial, "categoriaId");

    form.setFieldsValue({
      sku: pickOptionalString(initial, "sku") ?? "",
      nombre: pickOptionalString(initial, "nombre") ?? "",
      descripcion: initialDescripcion,
      precio: pickOptionalNumber(initial, "precio") ?? 0,
      stock: pickOptionalNumber(initial, "stock") ?? 0,
      idCategoria: initialIdCategoria ?? undefined,
      activo: pickOptionalBoolean(initial, "activo") ?? true,
    });
  }, [open, initial, form]);

  const categoryOptions = categorias.flatMap((c) => {
    const id = pickOptionalNumber(c, "idCategoria") ?? pickOptionalNumber(c, "id");
    if (typeof id !== "number") return [];
    const nombre = pickOptionalString(c, "nombre") ?? "";
    return [{ label: `${nombre} (#${id})`, value: id }];
  });

  const title = isEdit
    ? t("products.editTitle", { defaultValue: "Editar producto" })
    : t("products.newTitle", { defaultValue: "Nuevo producto" });

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={title}
      destroyOnHidden
      width={720}
    >
      <Form<ProductoFormValues>
        form={form}
        layout="vertical"
        onFinish={async (v) => {
          try {
            if (typeof v.idCategoria !== "number") {
              throw new Error(
                t("products.categoryReq", { defaultValue: "Categoría requerida" })
              );
            }

            const dto: ProductoCreateUpdateDto = {
              sku: v.sku,
              nombre: v.nombre,
              descripcion: v.descripcion ?? null,
              precio: v.precio,
              stock: v.stock,
              idCategoria: v.idCategoria,
              activo: v.activo ?? true,
            };

            if (isEdit && typeof initialIdProducto === "number") {
              await dispatch(updateProducto({ id: initialIdProducto, dto })).unwrap();
              toastSuccess(t("products.updatedOk", { defaultValue: "Producto actualizado" }));
            } else {
              await dispatch(createProducto({ dto })).unwrap();
              toastSuccess(t("products.createdOk", { defaultValue: "Producto creado" }));
            }

            onClose();
          } catch (e) {
            showError(t("errors.genericTitle", { defaultValue: "Error" }), e);
          }
        }}
      >
        <div className="grid2">
          <Form.Item
            name="sku"
            label={t("products.sku", { defaultValue: "SKU" })}
            rules={[
              { required: true, message: t("products.skuReq", { defaultValue: "SKU requerido" }) },
            ]}
          >
            <Input placeholder="SKU-001" />
          </Form.Item>

          <Form.Item
            name="nombre"
            label={t("common.name", { defaultValue: "Nombre" })}
            rules={[
              { required: true, message: t("common.nameReq", { defaultValue: "Nombre requerido" }) },
              { min: 2, message: t("auth.minChars", { n: 2, defaultValue: "Mínimo 2 caracteres" }) },
            ]}
          >
            <Input placeholder={t("common.name", { defaultValue: "Nombre" })} />
          </Form.Item>
        </div>

        <Form.Item name="descripcion" label={t("common.description", { defaultValue: "Descripción" })}>
          <Input.TextArea rows={3} placeholder={t("common.optional", { defaultValue: "Opcional" })} />
        </Form.Item>

        <div className="grid3">
          <Form.Item
            name="precio"
            label={t("products.price", { defaultValue: "Precio" })}
            rules={[
              { required: true, message: t("products.priceReq", { defaultValue: "Precio requerido" }) },
            ]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item
            name="stock"
            label={t("products.stock", { defaultValue: "Stock" })}
            rules={[
              { required: true, message: t("products.stockReq", { defaultValue: "Stock requerido" }) },
            ]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item
            name="idCategoria"
            label={t("products.category", { defaultValue: "Categoría" })}
            rules={[
              { required: true, message: t("products.categoryReq", { defaultValue: "Categoría requerida" }) },
            ]}
          >
            <Select
              placeholder={t("products.categoriaPh", { defaultValue: "Selecciona" })}
              options={categoryOptions}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="activo"
          label={t("common.active", { defaultValue: "Activo" })}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button onClick={onClose}>{t("common.cancel", { defaultValue: "Cancelar" })}</Button>
          <Button type="primary" htmlType="submit">
            {t("common.save", { defaultValue: "Guardar" })}
          </Button>
        </Space>
      </Form>
    </Modal>
  );
}
