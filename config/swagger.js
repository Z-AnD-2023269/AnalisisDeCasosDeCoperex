import { version } from "mongoose";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express"

const swaggerOptions = {
    swaggerDefinition:{
        openapi: "3.0.0",
        info:{
            title: "Sistema de Analisis de Casos de Coperex",
            version:"1.0.0",
            "description": "API para la gestión de empresas en la feria Interfer, permitiendo registro, consulta y generación de reportes en Excel. Desarrollada con Node.js, Express y MongoDB.",
            contact:{
                name: "Anderson Lopez",
                email: "alopez-2023269@kinal.org.gt"
            }
        },
        servers:[
            {
                url: "http://127.0.0.1:3000/CoperexCaseAnalysis/v1"
            }
        ]
    },
    apis:[
        "./src/auth/*.js",
        "./src/enterprise/*.js",
    ]
}

const swaggerDocs = swaggerJSDoc(swaggerOptions)

export { swaggerDocs, swaggerUi }