import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
}, { timestamps: true }
);

const expertiseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    }
}, { timestamps: true }
);

const Department = mongoose.model('Department', departmentSchema);
const Expertise = mongoose.model('Expertise', expertiseSchema);