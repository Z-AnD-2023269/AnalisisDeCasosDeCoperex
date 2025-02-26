`use strict`;

import { Router } from "express";
import { registerEnterprise } from "./enterprise.controller.js";
import { validateEnterprise } from "../middlewares/enterprise-validator.js";

const router = Router();

/**
 * @swagger
 * /enterprises:
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
 *       201:
 *         description: Empresa registrada exitosamente
 *       400:
 *         description: Error en la solicitud
 *       500:
 *         description: Error interno del servidor
 */
router.post("/registerEnterprise", validateEnterprise, registerEnterprise )

export default router;