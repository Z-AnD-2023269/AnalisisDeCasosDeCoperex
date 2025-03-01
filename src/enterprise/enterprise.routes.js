`use strict`;

import { Router } from "express";
import { registerEnterprise, getEnterprises, updateEnterprise, generateEnterpriseReport } from "./enterprise.controller.js";
import { validateEnterprise, validateGetEnterprises, updateEnterpriseValidator, generateEnterpriseReportValidator } from "../middlewares/enterprise-validator.js";

const router = Router();

/**
 * @swagger
 * /enterprises/registerEnterprise:
 *   post:
 *     summary: Registra una nueva empresa
 *     tags: [Enterprises]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "TechCorp"
 *               email:
 *                 type: string
 *                 example: "contact@techcorp.com"
 *               phone:
 *                 type: string
 *                 example: "12345678"
 *               address:
 *                 type: string
 *                 example: "Avenida Principal 123"
 *               website:
 *                 type: string
 *                 example: "https://techcorp.com"
 *               impactLevel:
 *                 type: string
 *                 enum: ["Alto", "Medio", "Bajo"]
 *                 example: "Alto"
 *               foundingYear:
 *                 type: number
 *                 example: 2010
 *               category:
 *                 type: string
 *                 example: "Tecnología"
 *               description:
 *                 type: string
 *                 example: "Empresa dedicada a la innovación tecnológica"
 *     responses:
 *       201:
 *         description: Empresa registrada exitosamente
 *       400:
 *         description: Error en la solicitud
 *       500:
 *         description: Error interno del servidor
 */
router.post("/registerEnterprise", validateEnterprise, registerEnterprise )

/**
 * @swagger
 * /enterprises/list:
 *   get:
 *     summary: Obtiene la lista de empresas con filtros opcionales y ordenamiento
 *     tags: [Enterprises]
 *     parameters:
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtra por categoría de empresa
 *       - in: query
 *         name: impactLevel
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["Alto", "Medio", "Bajo"]
 *         description: Filtra por nivel de impacto
 *       - in: query
 *         name: yearsOfExperience
 *         required: false
 *         schema:
 *           type: number
 *         description: Filtra empresas con al menos X años de experiencia
 *       - in: query
 *         name: sort
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["nameAZ", "nameZA", "experience"]
 *         description: Ordena los resultados (name{A-Z}, name{Z-A}, experience)
 *       - in: query
 *         name: limite
 *         required: false
 *         schema:
 *           type: number
 *           default: 10
 *         description: Número máximo de empresas a devolver
 *       - in: query
 *         name: desde
 *         required: false
 *         schema:
 *           type: number
 *           default: 0
 *         description: Índice desde donde empezar la paginación
 *     responses:
 *       200:
 *         description: Lista de empresas filtradas y ordenadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 enterprises:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       address:
 *                         type: string
 *                       website:
 *                         type: string
 *                       impactLevel:
 *                         type: string
 *                       foundingYear:
 *                         type: number
 *                       yearsOfExperience:
 *                         type: number
 *                       category:
 *                         type: string
 *                       description:
 *                         type: string
 *       400:
 *         description: Error en la solicitud (parámetros no válidos)
 *       500:
 *         description: Error interno del servidor
 */
router.get("/list", validateGetEnterprises, getEnterprises)

/**
 * @swagger
 * /enterprises/updateEnterprise/{uid}:
 *   put:
 *     summary: Actualiza una empresa existente
 *     tags: [Enterprises]
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la empresa a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "TechCorp"
 *               email:
 *                 type: string
 *                 example: "contact@techcorp.com"
 *               phone:
 *                 type: string
 *                 example: "12345678"
 *               address:
 *                 type: string
 *                 example: "Avenida Principal 123"
 *               website:
 *                 type: string
 *                 example: "https://techcorp.com"
 *               impactLevel:
 *                 type: string
 *                 enum: ["Alto", "Medio", "Bajo"]
 *                 example: "Alto"
 *               yearsOfExperience:
 *                 type: number
 *                 example: 10
 *               category:
 *                 type: string
 *                 example: "Tecnología"
 *               description:
 *                 type: string
 *                 example: "Empresa dedicada a la innovación tecnológica"
 *     responses:
 *       200:
 *         description: Empresa actualizada exitosamente
 *       400:
 *         description: Error en la solicitud (parámetros no válidos)
 *       404:
 *         description: Empresa no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.put("/updateEnterprise/:uid", updateEnterpriseValidator, updateEnterprise)

/**
 * @swagger
 * /enterprises/generateReport:
 *   get:
 *     summary: Genera un reporte en Excel con los filtros aplicados
 *     tags: [Enterprises]
 *     parameters:
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtra por categoría de empresa
 *       - in: query
 *         name: impactLevel
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["Alto", "Medio", "Bajo"]
 *         description: Filtra por nivel de impacto
 *       - in: query
 *         name: yearsOfExperience
 *         required: false
 *         schema:
 *           type: number
 *         description: Filtra empresas con al menos X años de experiencia
 *       - in: query
 *         name: sort
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["nameAZ", "nameZA", "experience"]
 *         description: Ordena los resultados
 *     responses:
 *       200:
 *         description: Reporte generado exitosamente
 *       400:
 *         description: Error en la solicitud (parámetros no válidos)
 *       500:
 *         description: Error interno del servidor
 */
router.get("/generateReport", generateEnterpriseReportValidator, generateEnterpriseReport)

export default router;
