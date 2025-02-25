import { Schema, model } from "mongoose";

const enterpriseSchema = Schema({
    name: {
        type: String,
        required: [true, "El nombre de la empresa es obligatorio"],
        maxLength: [50, "El nombre no puede superar los 50 caracteres"]
    },
    email: {
        type: String,
        required: [true, "El correo electrónico es obligatorio"],
        unique: true
    },
    phone: {
        type: String,
        required: [true, "El número de teléfono es obligatorio"],
        minLength: [8, "El número de teléfono debe tener al menos 8 dígitos"],
        maxLength: [15, "El número de teléfono no puede superar los 15 dígitos"]
    },
    address: {
        type: String,
        required: [true, "La dirección es obligatoria"],
        maxLength: [100, "La dirección no puede superar los 100 caracteres"]
    },
    website: {
        type: String,
        validate: {
            validator: function (v) {
                return /^https?:\/\/.+/.test(v);
            },
            message: "El sitio web debe ser una URL válida"
        }
    },
    impactLevel: {
        type: String,
        required: [true, "El nivel de impacto es obligatorio"],
        enum: ["Alto", "Medio", "Bajo"]
    },
    foundingYear: {
        type: Number,
        required: [true, "El año de fundación es obligatorio"],
        min: [1800, "El año de fundación debe ser mayor a 1800"]
    },
    yearsOfExperience: {
        type: Number,
        required: true,
        default: function () {
            return new Date().getFullYear() - this.foundingYear;
        }
    },
    category: {
        type: String,
        required: [true, "La categoría empresarial es obligatoria"]
    },
    description: {
        type: String,
        maxLength: [500, "La descripción no puede superar los 500 caracteres"]
    },
    socialMedia: {
        facebook: { type: String },
        instagram: { type: String }
    }
}, {
    versionKey: false,
    timestamps: true 
})

enterpriseSchema.methods.toJSON = function () {
    const { _id, ...enterprise } = this.toObject();
    enterprise.uid = _id;
    return enterprise;
}

export default model("Enterprise", enterpriseSchema)
