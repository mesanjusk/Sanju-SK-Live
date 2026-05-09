import mongoose from 'mongoose';

const UsersSchema=new mongoose.Schema({
    User_uuid: { type: String },
    User_name: { type: String, required: true },
    Password: { type:String, required: true},
    Mobile_number: { type: Number, required: true, unique: true },
 })

export default mongoose.model('Users', UsersSchema);