// models/user.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    country_code: {
        type: Number,
        required: true,
    },
    contact_no: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    date_created: {
        type: Date,
        default: Date.now,
    },
    admin: {
        type: Boolean,
        required: true,
    },
    verified: {
        type: Boolean,
        required: true,
        default: false,
    },
    status: {
        type: Boolean,
        required: true,
        default: false,
    },
    sex: {
        type: String,
        required: false,
    },
    about: {
        type: String,
        required: false,
    },
    address: {
        address_line_one: {
            type: String,
            required: false,
        },
        addressline_two: {
            type: String,
            required: false,
        },
        country: {
            type: String,
            required: false,
        },
        state: {
            type: String,
            required: false,
        },
        city: {
            type: String,
            required: false,
        },
        zip_code: {
            type: String,
            required: false,
        },
    },
    date_of_birth: {
        type: String,
        required: false,
    },
    interests: {
        type: Map,
        of: Number, // Store interest scores as numbers
        required: false,
        default: {},
    },
    profile_image: {
        type: String,
        required: true,
        default: 'null'
    }
});

export const UserPending = mongoose.model('UserPending', userSchema);