import { expect, test } from "@playwright/test";
import { ids, installCharlasMocks, login } from "./charlas.fixtures";

test("ADMIN: login y configuración operativa hasta asignar una charla", async ({ page }) => {
  await installCharlasMocks(page, "ADMIN");
  await login(page, "admin@cun.edu.co");
  await page.getByRole("link", { name: "Procesos" }).first().click();
  await expect(page.getByText("Analista de datos").first()).toBeVisible();
  await page.getByRole("button", { name: "Abrir Analista de datos" }).click();
  await page.getByRole("button", { name: "Crear proceso CHARLAS" }).click();

  await page.getByRole("button", { name: /^Plantilla/ }).click();
  await page.getByLabel("Versión publicada").selectOption(ids.version);
  await page.getByRole("button", { name: "Asignar para futuras charlas" }).click();

  await page.getByRole("button", { name: /^Candidatos/ }).click();
  await page.getByRole("button", { name: "Registrar candidato" }).click();
  await page.getByLabel("Nombre completo").fill("Ana Pérez");
  await page.getByRole("button", { name: "Registrar y vincular" }).click();
  await expect(page.getByText("Ana Pérez").first()).toBeVisible();

  await page.getByRole("button", { name: /^Participantes/ }).click();
  await page.getByRole("button", { name: "Agregar" }).click();
  await page.getByLabel("Usuario").selectOption(ids.interviewer);
  await page.getByRole("button", { name: "Guardar participante" }).click();

  await page.getByRole("button", { name: /^Charlas/ }).click();
  await page.getByLabel("Entrevistador para Ana Pérez").selectOption(ids.interviewer);
  await page.getByRole("button", { name: "Asignar", exact: true }).click();
  await expect(page.getByText("Pendiente").first()).toBeVisible();
});

test("INTERVIEWER: ve solo su trabajo, inicia, guarda y completa", async ({ page }) => {
  await installCharlasMocks(page, "INTERVIEWER");
  await login(page);
  await page.getByRole("link", { name: "Mis charlas" }).first().click();
  await page.getByRole("button", { name: /Ana Pérez/ }).click();
  await page.getByRole("button", { name: "Iniciar charla" }).click();
  await page.getByLabel(/Cuéntanos un logro relevante/).fill("Automaticé un proceso y reduje el tiempo un 30%.");
  await page.getByRole("button", { name: "Guardar" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Finalizar" }).click();
  await expect(page.getByText("Completada").first()).toBeVisible();

  await page.goto("/charlas/admin");
  await expect(page.getByRole("heading", { name: "No tienes acceso a esta sección" })).toBeVisible();
});

test("RESPONSIBLE: revisa cobertura, comparativo y registra decisión", async ({ page }) => {
  await installCharlasMocks(page, "RESPONSIBLE");
  await login(page);
  await expect(page.getByRole("heading", { name: "Procesos bajo tu responsabilidad" })).toBeVisible();
  await page.getByRole("link", { name: "Abrir proceso" }).click();
  await expect(page.getByRole("heading", { name: "Checklist del proceso" })).toBeVisible();
  await page.getByRole("button", { name: "Comparativo y decisiones" }).click();
  await expect(page.getByText("Comparativo del proceso")).toBeVisible();
  await page.getByRole("button", { name: "Consolidar candidato" }).click();
  await page.getByRole("link", { name: "Ver detalle" }).click();
  await expect(page.getByText("La candidata demuestra experiencia relevante.")).toBeVisible();
  await page.getByRole("button", { name: "Registrar decisión" }).click();
  await page.getByLabel("Decisión humana", { exact: true }).selectOption("SELECTED");
  await page.getByLabel("Justificación obligatoria").fill("La evidencia y el comparativo respaldan la selección.");
  await page.getByRole("button", { name: "Confirmar decisión" }).click();
  await expect(page.getByText("Seleccionado").first()).toBeVisible();
});
