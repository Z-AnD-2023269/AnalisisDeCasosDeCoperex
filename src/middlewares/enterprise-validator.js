`use strict`;

import { body } from "express-validator";
import { enterpriseExists } from "../helpers/db-validators.js";
import { validarCampos } from "./validate-fields.js";
import { handleErrors } from "./handle-errors.js";
import { validateJWT } from "./validate-jwt.js";
import { hasRoles } from "./validate-roles.js";

export const validateEnterprise = [
    validateJWT,
    hasRoles("ADMIN_ROLE"),
    body("name").notEmpty().withMessage("El nombre de la empresa es obligatorio"),
    body("email").notEmpty().withMessage("El correo electrónico es obligatorio"),
    body("email").isEmail().withMessage("No es un email válido"),
    body("email").custom(enterpriseExists),
    body("phone").isLength({ min: 8 }).withMessage("El número de teléfono debe tener 8 dígitos"),
    body("address").notEmpty().withMessage("La dirección es obligatoria"),
    body("impactLevel").isIn(["Alto", "Medio", "Bajo"]).withMessage("El nivel de impacto debe ser Alto, Medio o Bajo"),
    body("foundingYear").isInt({ min: 1800, max: new Date().getFullYear() }).withMessage("El año de fundación debe estar entre 1800 y el año actual"),
    body("category").notEmpty().withMessage("La categoría empresarial es obligatoria"),
    validarCampos,
    handleErrors
]
