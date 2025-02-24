import { Schema, model } from "mongoose";

const adminSchema = Schema({
    name: {
        type: String,
        required: [true, "El nombre es obligatorio"],
        maxLength: [25, "El nombre no puede superar los 25 caracteres"]
    },
    email: {
        type: String,
        required: [true, "Se requiere correo electrónico"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Se requiere contraseña"]
    },
    phone: {
        type: String,
        minLength: 8,
        maxLength: 8,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ["ADMIN_ROLE"],
        default: "ADMIN_ROLE"
    }
}, {
    versionKey: false,
    timestamps: true
});

adminSchema.methods.toJSON = function() {
    const { password, _id, ...admin } = this.toObject();
    admin.uid = _id;
    return admin;
};

export default model("Admin", adminSchema);
